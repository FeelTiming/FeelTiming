from django.urls import path
import user.views

urlpatterns = [
    path('login/', user.views.login, name='login'), 
    path('signup/', user.views.signup, name='signup'),
    path('logout/', user.views.logout, name='logout'),
]
