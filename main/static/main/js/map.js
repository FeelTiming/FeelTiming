function geoFindMe() {
	function kakao_map(latitude, longitude) {
		var latitude;
		var longitude;
		if (latitude === null && longitude === null) {
			latitude = 37.5760222;
			longitude = 126.9769;
		} else {
			latitude = latitude;
			longitude = longitude;
		}

		var container = document.getElementById("map");
		var options_kakao = {
			center: new kakao.maps.LatLng(latitude, longitude),
			level: 3,
		};
		var map = new kakao.maps.Map(container, options_kakao);

		var imageSrc = "static/main/image/current.png", // 마커이미지의 주소입니다
			imageSize = new kakao.maps.Size(20, 20); // 마커이미지의 크기입니다

		var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

		var markerPosition = new kakao.maps.LatLng(latitude, longitude);
		var marker = new kakao.maps.Marker({
			position: markerPosition,
			image: markerImage,
		});

		marker.setMap(map);
	}

	const options = {
		enableHighAccuracy: true,
		maximumAge: 30000,
		timeout: 15000,
	};

	function success(position) {
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;
		kakao_map(latitude, longitude);
	}

	function error(error) {
		switch (error.code) {
			case error.PERMISSION_DENIED:
				loc.innerHTML = "이 문장은 사용자가 Geolocation API의 사용 요청을 거부했을 때 나타납니다!";
				break;

			case error.POSITION_UNAVAILABLE:
				loc.innerHTML = "이 문장은 가져온 위치 정보를 사용할 수 없을 때 나타납니다!";
				break;

			case error.TIMEOUT:
				loc.innerHTML = "이 문장은 위치 정보를 가져오기 위한 요청이 허용 시간을 초과했을 때 나타납니다!";
				break;

			case error.UNKNOWN_ERROR:
				loc.innerHTML = "이 문장은 알 수 없는 오류가 발생했을 때 나타납니다!";
				break;
		}
	}

	if (!navigator.geolocation) {
		alert("위치 정보 접근 불가");
	} else {
		navigator.geolocation.watchPosition(success, error, options);
	}
}

geoFindMe();
