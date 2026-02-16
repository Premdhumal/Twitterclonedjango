from . import views
from django.urls import path

urlpatterns = [
    # Legacy template views
    path('', views.tweet_list, name='tweet_list'),
    path('create/', views.tweet_create, name='tweet_create'),
    path('<int:tweet_id>/edit/', views.tweet_edit, name='tweet_edit'),
    path('<int:tweet_id>/delete/', views.tweet_delete, name='tweet_delete'),
    path('register/', views.register, name='register'),

    # ─── REST API ───
    path('api/auth/status/', views.AuthStatusView.as_view(), name='api_auth_status'),
    path('api/auth/login/', views.APILoginView.as_view(), name='api_login'),
    path('api/auth/logout/', views.APILogoutView.as_view(), name='api_logout'),
    path('api/auth/register/', views.APIRegisterView.as_view(), name='api_register'),

    path('api/tweets/', views.TweetListCreateView.as_view(), name='api_tweets'),
    path('api/tweets/<int:pk>/', views.TweetDetailView.as_view(), name='api_tweet_detail'),
    path('api/tweets/<int:pk>/like/', views.LikeToggleView.as_view(), name='api_like_toggle'),

    path('api/notifications/', views.NotificationListView.as_view(), name='api_notifications'),

    path('api/profile/<str:username>/', views.UserProfileView.as_view(), name='api_profile'),
    path('api/profile/<str:username>/tweets/', views.UserTweetsView.as_view(), name='api_user_tweets'),
]
