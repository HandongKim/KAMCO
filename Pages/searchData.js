var Observable = require('FuseJS/Observable');
var Storage = require('FuseJS/Storage');
var Backend = require("Module/Backend.js");
//캠코 서비스 키 값
//LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D

var showItems = Observable();

var options = {type:["전체", "매각", "임대"], date: ["7일 이내", "30일 이내"]};
var selected = {type: Observable("전체") , date: Observable("7일 이내"), sido: Observable(), sgk: Observable(), emd: Observable()};
var address = {
		sido: Observable("시도"),
		sgk: Observable("시군구"),
		emd: Observable("읍면동"),
		data1: Observable(),
		data2: Observable(),
		data3: Observable()
	};
var showPanel = {base: Observable(false), data1: Observable("0"), data2: Observable("0"), data3: Observable("0")};

Storage.read("search.xml")
	.then(function(contents) {
		var items;
		items = JSON.parse(contents);
		for (var i = 0 ; i < items.response.body.items.length-1 ; i++) {
			if (items.response.body.items[i].item.PLNM_NO != items.response.body.items[i+1].item.PLNM_NO) {
				showItems.add(items.response.body.items[i]);
			}
			if (i == items.response.body.items.length-2) {
				showItems.add(items.response.body.items[i+1]);
			}
		}
	}, function(error) {
		console.log(error);
	});

// api에서 데이터를 받아오는 함수
function getData(url) {
	return fetch(url).then(function(response) {
		return response.text();
	}).then(function(responseObject) {
		var data = Backend.parsingXMLData(responseObject);
		return data;
	}).catch(function(err) {
		console.log(JSON.stringify(err));
	});
}

// 날짜를 온비드 형식에 맞추어 반환
function callDate(year, month, date) {
	if (month < 10) {
		month = "0" + month;
	}
	if (date < 10) {
		date = "0" + date;
	}

	return year + month + date;
}

function searchData() {
// 검색 url
	var url = "http://openapi.onbid.co.kr/openapi/services/KamcoPblsalThingInquireSvc/getKamcoSaleList?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D";

// 타입 선택에 따른 url 추가
	if (selected.type == "전체") {
		url = url + "&DPSL_MTD_CD=ALL";
	} else if (selected.type == "매각") {
		url = url + "&DPSL_MTD_CD=0001";
	} else if (selected.type == "임대") {
		url = url + "&DPSL_MTD_CD=0002";
	}

// 시간 설정을 위한 Date 변수 추가
	var date = new Date();

// 기간 선택에 따른 url 추가
	if (selected.date == "7일 이내") {
		url = url + "&PBCT_BEGN_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());

		date.setDate(date.getDate()+7);
		url = url + "&PBCT_CLS_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());
	} else if (selected.date == "30일 이내") {
		url = url + "&PBCT_BEGN_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());

		date.setDate(date.getDate()+30);
		url = url + "&PBCT_CLS_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());
	}
// 주소 선택에 따른 url 추가
	if (address.emd.value != "읍면동") {
		url = url + "&EMD=" + address.emd.value;
	}
	if (address.sgk.value != "시군구") {
		url = url + "&SGK=" + address.sgk.value;
	}
	if (address.emd.value != "시도") {
		url = url + "&SIDO=" + address.sido.value;
	}

	showItems.clear()
	getData(url).then(function(items) {
		for (var i = 0 ; i < items.response.body.items.length-1 ; i++) {
			if (items.response.body.items[i].item.PLNM_NO != items.response.body.items[i+1].item.PLNM_NO) {
				showItems.add(items.response.body.items[i]);
			}
			if (i == items.response.body.items.length-2) {
				showItems.add(items.response.body.items[i+1]);
			}
		}

		if (items.totalCount != 0) {
			Storage.write("search.xml", JSON.stringify(items))
				.then(function(succeeded) {
			        if(succeeded) {
						console.log("Successfully wrote to file.");
					} else {
						console.log("Couldn't write to file.");
					}
				});
		}
	});
}

//시도 구역 선택
function selectSido(arg) {
	address.sgk.replaceAll(["시군구"]);
	address.emd.replaceAll(["읍면동"]);

	showPanel.base.value = !showPanel.base.value;
	showPanel.data1.value = "0";
}
//시도 구역 받아오기
function getSido() {
	var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidAddr1Info?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999';

	address.data1.clear();
	showPanel.base.value = !showPanel.base.value;
	showPanel.data1.value = "0.9";

	if (address.data1.length == 0) {
		getData(url).then(function(code) {
			code.response.body.items.forEach(function(item) {
				address.data1.add(item.item.ADDR1);
			});
			address.data1.removeRange(0, 1);
		});
	}
}
//시군구 구역 선택
function selectSgk(arg) {
	address.emd.replaceAll(["읍면동"]);

	showPanel.base.value = !showPanel.base.value;
	showPanel.data2.value = "0";
}
//시군구 구역 받아오기
function getSgk() {
	if (address.sido.value != "시도") {
		var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidAddr2Info?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999&ADDR1='+address.sido.value;

		address.data2.clear();
		showPanel.base.value = !showPanel.base.value;
		showPanel.data2.value = "0.9";

		if (address.data2.length == 0) {
			getData(url).then(function(code) {
				code.response.body.items.forEach(function(item) {
					address.data2.add(item.item.ADDR2);
				});
			});
		}
	}
}
//읍면동 구역 선택
function selectEmd(arg) {
	showPanel.base.value = !showPanel.base.value;
	showPanel.data3.value = "0";
}
//읍면동 구역 받아오기
function getEmd() {
	if (address.sgk.value != "시군구") {
		var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidAddr3Info?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999&ADDR2='+address.sgk.value;

		address.data3.clear();
		showPanel.base.value = !showPanel.base.value;
		showPanel.data3.value = "0.9";

		if (address.data3.length == 0) {
			getData(url).then(function(code) {
				code.response.body.items.forEach(function(item) {
					address.data3.add(item.item.ADDR3);
				});
			});
		}
	}
}

function closePanel() {
	showPanel.base.value = !showPanel.base.value;
	showPanel.data1.value = "0";
	showPanel.data2.value = "0";
	showPanel.data3.value = "0";
	address.data1.clear();
	address.data2.clear();
	address.data3.clear();
}

module.exports = {
	searchData,

	showItems,

	options, selected,

	address, selectSido, selectSgk, selectEmd, getSido, getSgk, getEmd,

	showPanel, closePanel,

	goDetail: function(arg) {
		router.push("detailData", arg.data.item);
	},
	goBack: function() {
		router.goBack();
	}
};