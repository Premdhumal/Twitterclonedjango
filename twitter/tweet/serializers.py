from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Tweet, Like, Notification, UserProfile


class UserMiniSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'avatar_url']

    def get_display_name(self, obj):
        if hasattr(obj, 'profile') and obj.profile.display_name:
            return obj.profile.display_name
        return obj.username

    def get_avatar_url(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.avatar_url
        return ''


class TweetSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True, default=0)
    is_liked = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Tweet
        fields = ['id', 'user', 'text', 'photo_url', 'created_at', 'updated_at', 'like_count', 'is_liked']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_photo_url(self, obj):
        if obj.photo:
            return obj.photo.url
        return None


class TweetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tweet
        fields = ['text', 'photo']


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    tweet_count = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'display_name', 'bio', 'avatar_url',
                  'header_url', 'location', 'website', 'date_joined', 'tweet_count', 'like_count']

    def get_tweet_count(self, obj):
        return obj.user.tweets.count()

    def get_like_count(self, obj):
        return obj.user.likes.count()


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserMiniSerializer(read_only=True)
    tweet_text = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'verb', 'tweet', 'tweet_text', 'is_read', 'created_at']

    def get_tweet_text(self, obj):
        if obj.tweet:
            return obj.tweet.text[:80]
        return None


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        UserProfile.objects.get_or_create(user=user)
        return user
