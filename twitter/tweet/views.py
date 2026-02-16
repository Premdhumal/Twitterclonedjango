from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login as auth_login, logout as auth_logout, authenticate
from django.shortcuts import get_object_or_404, redirect

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Tweet, Like, Notification, UserProfile
from .forms import TweetForm, Userregistrationform
from .serializers import (
    TweetSerializer, TweetCreateSerializer,
    UserProfileSerializer, NotificationSerializer,
    RegisterSerializer, UserMiniSerializer,
)


# ──────────────────────────────────
# LEGACY TEMPLATE VIEWS (keep)
# ──────────────────────────────────

def index(request):
    return render(request, 'index.html')


def tweet_list(request):
    tweets = Tweet.objects.all().order_by('-created_at')
    return render(request, 'tweet_list.html', {'tweets': tweets})


@login_required
def tweet_create(request):
    if request.method == "POST":
        form = TweetForm(request.POST, request.FILES)
        if form.is_valid():
            tweet = form.save(commit=False)
            tweet.user = request.user
            tweet.save()
            return redirect('tweet_list')
    else:
        form = TweetForm()
    return render(request, 'tweet_form.html', {'form': form})


@login_required
def tweet_edit(request, tweet_id):
    tweet = get_object_or_404(Tweet, id=tweet_id, user=request.user)
    if request.method == "POST":
        form = TweetForm(request.POST, request.FILES, instance=tweet)
        if form.is_valid():
            form.save()
            return redirect('tweet_list')
    else:
        form = TweetForm(instance=tweet)
    return render(request, "tweet_form.html", {"form": form, "edit_mode": True})


@login_required
def tweet_delete(request, tweet_id):
    tweet = get_object_or_404(Tweet, pk=tweet_id, user=request.user)
    if request.method == 'POST':
        tweet.delete()
        return redirect('tweet_list')
    return render(request, 'tweet_confirm_delete.html', {'tweet': tweet})


def register(request):
    if request.method == 'POST':
        form = Userregistrationform(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password1'])
            user.save()
            UserProfile.objects.get_or_create(user=user)
            auth_login(request, user)
            return redirect('tweet_list')
    else:
        form = Userregistrationform()
    return render(request, 'registration/register.html', {'form': form})


# ──────────────────────────────────
# REST API VIEWS
# ──────────────────────────────────

# --- Auth ---

class AuthStatusView(APIView):
    """Return current user info or 401."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            UserProfile.objects.get_or_create(user=request.user)
            return Response({
                'is_authenticated': True,
                'user': UserMiniSerializer(request.user).data,
            })
        return Response({'is_authenticated': False})


class APILoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user:
            auth_login(request, user)
            UserProfile.objects.get_or_create(user=user)
            return Response({
                'success': True,
                'user': UserMiniSerializer(user).data,
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class APILogoutView(APIView):
    def post(self, request):
        auth_logout(request)
        return Response({'success': True})


class APIRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            auth_login(request, user)
            return Response({
                'success': True,
                'user': UserMiniSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- Tweets ---

class TweetListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        tweets = Tweet.objects.select_related('user').all()
        serializer = TweetSerializer(tweets, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = TweetCreateSerializer(data=request.data)
        if serializer.is_valid():
            tweet = serializer.save(user=request.user)
            out = TweetSerializer(tweet, context={'request': request})
            return Response(out.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TweetDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get_object(self, pk):
        return get_object_or_404(Tweet, pk=pk)

    def get(self, request, pk):
        tweet = self.get_object(pk)
        serializer = TweetSerializer(tweet, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        tweet = self.get_object(pk)
        if tweet.user != request.user:
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        serializer = TweetCreateSerializer(tweet, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            out = TweetSerializer(tweet, context={'request': request})
            return Response(out.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        tweet = self.get_object(pk)
        if tweet.user != request.user:
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        tweet.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- Likes ---

class LikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        tweet = get_object_or_404(Tweet, pk=pk)
        like, created = Like.objects.get_or_create(user=request.user, tweet=tweet)
        if not created:
            like.delete()
            return Response({'liked': False, 'like_count': tweet.like_count})
        # Create notification (don't notify self)
        if tweet.user != request.user:
            Notification.objects.create(
                recipient=tweet.user,
                actor=request.user,
                verb='like',
                tweet=tweet,
            )
        return Response({'liked': True, 'like_count': tweet.like_count})


# --- Notifications ---

class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifs = request.user.notifications.all()[:50]
        serializer = NotificationSerializer(notifs, many=True)
        unread = request.user.notifications.filter(is_read=False).count()
        return Response({'notifications': serializer.data, 'unread_count': unread})

    def post(self, request):
        """Mark all as read."""
        request.user.notifications.filter(is_read=False).update(is_read=True)
        return Response({'success': True})


# --- User Profile ---

class UserProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        from django.contrib.auth.models import User as AuthUser
        user = get_object_or_404(AuthUser, username=username)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request, username):
        if not request.user.is_authenticated or request.user.username != username:
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserTweetsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        from django.contrib.auth.models import User as AuthUser
        user = get_object_or_404(AuthUser, username=username)
        tweets = Tweet.objects.filter(user=user)
        serializer = TweetSerializer(tweets, many=True, context={'request': request})
        return Response(serializer.data)

from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def csrf_init(request):
    return JsonResponse({"detail": "CSRF cookie set"})