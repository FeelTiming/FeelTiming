var map;
var latitude;
var longitude;

function kakao_map(latitude, longitude) {
	if (latitude === null && longitude === null) {
		latitude = 37.5760222; // 광화문 좌표
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
	map = new kakao.maps.Map(container, options_kakao);

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

function success(position) {
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
}

const options = {
	enableHighAccuracy: true,
	maximumAge: 30000,
	timeout: 15000,
};

function geoFindMe() {
	function success(position) {
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
		kakao_map(latitude, longitude);
	}

	if (!navigator.geolocation) {
		alert("위치 정보 접근 불가");
	} else {
		navigator.geolocation.getCurrentPosition(success, error, options);
	}
}

// 지도타입 컨트롤의 지도 또는 스카이뷰 버튼을 클릭하면 호출되어 지도타입을 바꾸는 함수입니다
function setCenter() {
	if (!navigator.geolocation) {
		alert("위치 정보 접근 불가");
	} else {
		navigator.geolocation.watchPosition(success, error, options);
		var moveLatLng = new kakao.maps.LatLng(latitude, longitude);
		map.panTo(moveLatLng);
	}
}

var clicked = true;
function getLoadView() {
	if (clicked) {
		map.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
		clicked = false;
	} else {
		map.removeOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
		clicked = true;
	}
}

function makeMarker(place) {
	var ps = new kakao.maps.services.Places();
	ps.keywordSearch(place, placesSearchCB);
}

function placesSearchCB(data, status, pagination) {
	if (status === kakao.maps.services.Status.OK) {
		// 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
		// LatLngBounds 객체에 좌표를 추가합니다
		var bounds = new kakao.maps.LatLngBounds();
		displayMarker(data[0]);
	}
}
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

// 지도에 마커를 표시하는 함수입니다
function displayMarker(place) {
	// 마커를 생성하고 지도에 표시합니다
	var imageSrc = "static/main/image/smoke.svg", // 마커이미지의 주소입니다
		imageSize = new kakao.maps.Size(24, 24); // 마커이미지의 크기입니다

	var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
	var marker = new kakao.maps.Marker({
		map: map,
		position: new kakao.maps.LatLng(place.y, place.x),
		image: markerImage,
	});

	// 마커에 클릭이벤트를 등록합니다
	kakao.maps.event.addListener(marker, "click", function () {
		// 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
		infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + "</div>");
		infowindow.open(map, marker);
	});
}

geoFindMe();
