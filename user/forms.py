from django import forms
from django.contrib.auth.forms import UserCreationForm
from user.models import User


class UserForm(UserCreationForm):
    nickname = forms.CharField(max_length=10)
    email = forms.EmailField(label="이메일")

    class Meta:
        model = User
        fields = ("username", "password1", "password2", "email", "nickname")
