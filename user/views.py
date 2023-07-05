from django.shortcuts import render, redirect, get_object_or_404
from .models import User
from .forms import UserForm
from django.contrib.auth import authenticate, login, get_user_model
# Create your views here.

# 회원 가입
def signup(request):
    # signup 으로 POST 요청이 왔을 때, 새로운 유저를 만드는 절차를 밟는다.
    if request.method == 'POST':
        form = UserForm(request.POST)
        # password와 confirm에 입력된 값이 같다면
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)  # 사용자 인증
            login(request, user)  # 로그인
            return redirect('/')
    else:
        form = UserForm()
    # signup으로 GET 요청이 왔을 때, 회원가입 화면을 띄워준다.
    return render(request, 'user/signup.html', {'form': form})

def mypage(request, pk):
    User = get_user_model()
    user = get_object_or_404(User, pk=pk)
    context = {'user': user}
    return render(request, 'user/mypage.html', context)
