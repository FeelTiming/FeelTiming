var map;
var latitude;
var longitude;
var clicked_marker;

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

	var clickedimageSrc = "static/main/image/place.svg",
		imageSize = new kakao.maps.Size(30, 30);
	var clickedmarkerImage = new kakao.maps.MarkerImage(clickedimageSrc, imageSize);

	clicked_marker = new kakao.maps.Marker({ image: clickedmarkerImage, zIndex: 2 });
	clicked_marker.setMap(map);

	kakao.maps.event.addListener(map, "click", function (mouseEvent) {
		var latlng = mouseEvent.latLng;
		clicked_marker.setPosition(latlng);
		var enrollbtn = document.getElementById("enrollbtn");
		enrollbtn.style.visibility = "visible";
	});

	var imageSrc = "static/main/image/current.png"; // 마커이미지의 주소입니다
	imageSize = new kakao.maps.Size(20, 20);
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
					description.push({
						desc: place[i].desc,
						id: data.documents[0].id,
						road_address_name: data.documents[0].road_address_name,
					});
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
		(
			await function (marker, title) {
				kakao.maps.event.addListener(marker, "click", function () {
					var linkRoute = document.getElementById("link_route");
					var linkRoadView = document.getElementById("link_roadView");
					linkRoute.href = "https://map.kakao.com/link/to/" + title.id;
					linkRoadView.href = "https://map.kakao.com/link/roadview/" + title.id;
					map.panTo(marker.getPosition());
					roadView(marker, title);
				});
				kakao.maps.event.addListener(map, "click", function () {
					var map_container = document.getElementById("map");
					var bar = document.getElementById("bottomBar");
					var roadviewContainer = document.getElementById("roadview");
					var roadviewbtn = document.getElementById("roadviewbtn");
					var currentbtn = document.getElementById("currentbtn");
					var enrollbtn = document.getElementById("enrollbtn");

					roadviewbtn.style.visibility = "visible";
					currentbtn.style.visibility = "visible";
					enrollbtn.style.visibility = "visible";

					map_container.style.height = "100%";
					bar.style.height = "0%";
					roadviewContainer.style.visibility = "hidden";
				});
			}
		)(marker, description[i]);
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

function roadView(marker, description) {
	var roadviewContainer = document.getElementById("roadview");
	var roadview = new kakao.maps.Roadview(roadviewContainer);
	var roadviewClient = new kakao.maps.RoadviewClient();

	var position = marker.getPosition();

	var address_1 = document.getElementById("address-1");
	var address_2 = document.getElementById("address-2");
	address_1.textContent = description.desc;
	address_2.textContent = description.road_address_name;

	var map_container = document.getElementById("map");
	var bar = document.getElementById("bottomBar");
	map_container.style.height = "70%";
	bar.style.height = "30%";
	bar.style.visibility = "visible";
	roadviewContainer.style.visibility = "visible";

	roadviewClient.getNearestPanoId(position, 50, function (panoId) {
		roadview.setPanoId(panoId, position);
	});
}

var geocoder = new kakao.maps.services.Geocoder();
function enroll() {
	var map_container = document.getElementById("map");
	var html = document.getElementById("enroll_page");
	var bar = document.getElementById("bottomBar");
	var roadviewbtn = document.getElementById("roadviewbtn");
	var currentbtn = document.getElementById("currentbtn");
	var enrollbtn = document.getElementById("enrollbtn");
	var enrollAddress = document.getElementById("enroll-address");

	roadviewbtn.style.visibility = "hidden";
	currentbtn.style.visibility = "hidden";
	enrollbtn.style.visibility = "hidden";
	map_container.style.height = "10%";
	bar.style.height = "0%";
	bar.style.visibility = "hidden";
	html.style.height = "90%";
	var coord = clicked_marker.getPosition();

	var callback = function (result, status) {
		if (status === kakao.maps.services.Status.OK) {
			enrollAddress.textContent = result[0].address.address_name;
		}
	};
	geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
}

geoFindMe();
