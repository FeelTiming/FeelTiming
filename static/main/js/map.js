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
	console.log(error);
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

// 인포윈도우
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
var coords = [];
var description = [];
async function findGeo(place) {
	const apiKey = "96b121da45a7569503823a0f6fcfd41b";

	for (var i = 0; i < place.length; i++) {
		// 주소 정보 가져오는 api 쓰기
		const keyword = place[i].location;
		await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}`, {
			headers: {
				Authorization: `KakaoAK ${apiKey}`,
			},
		})
			.then((response) => {
				if (response.ok) {
					return response.json(); // 응답 데이터를 JSON 형식으로 변환하여 반환
				} else {
					throw new Error("Error: " + response.status);
				}
			})
			.then((data) => {
				// 응답 데이터 처리
				if (data.documents.length !== 0) {
					var coord = new kakao.maps.LatLng(data.documents[0].y, data.documents[0].x);
					coords.push(coord);
					description.push(place[i].desc);
				}
			})
			.catch((error) => {
				// 에러 처리
				console.error(error);
			});
	}
	displayMarker(coords, description);
}

// 지도에 마커를 표시하는 함수입니다
async function displayMarker(coords, description) {
	// 마커를 생성하고 지도에 표시합니다
	for (var i = 0; i < coords.length; i++) {
		var marker = await addMarker(coords[i]);
		(function (marker, title) {
			kakao.maps.event.addListener(marker, "click", function () {
				displayInfowindow(marker, title);
			});
			kakao.maps.event.addListener(map, "click", function () {
				infowindow.close();
			});
		})(marker, description[i]);
	}
}

function addMarker(position) {
	var imageSrc = "static/main/image/smoke.svg", // 마커이미지의 주소입니다
		imageSize = new kakao.maps.Size(24, 24), // 마커이미지의 크기입니다
		markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

	var marker = new kakao.maps.Marker({
		position: position, // 마커의 위치
		image: markerImage,
	});

	marker.setMap(map); // 지도 위에 마커를 표출합니다

	return marker;
}

function displayInfowindow(marker, title) {
	var content = '<div class="info-window">' + "<p>" + title + "</p>" + "</div>";
	infowindow.setContent(content);
	infowindow.open(map, marker);
}

geoFindMe();
