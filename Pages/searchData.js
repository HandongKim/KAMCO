var Observable = require('FuseJS/Observable');
var Storage = require('FuseJS/Storage');
var Backend = require("Module/Backend.js");
//캠코 서비스 키 값
//LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D

var showItems = Observable();

var options = {
	sellType:["전체", "매각", "임대"],
	date: ["7일 이내", "30일 이내"],
	assetType: ["캠코\n압류", "캠코\n국유", "캠코\n수탁", "캠코\n유입", "이용\n기관"],
	usageTop: Observable(),
	usageMiddle: Observable(),
	usageBottom: Observable()
};
var selected = {
		sellType: Observable("전체"),
		date: Observable("7일 이내"),
		assetType: Observable("캠코\n압류"),
		sido: Observable("시도"),
		sgk: Observable("시군구"),
		emd: Observable("읍면동"),
		usageTop: Observable("전체"),
		usageMiddle: Observable("전체"),
		usageBottom: Observable("전체"),
	};

var address = {
		sido: Observable(),
		sgk: Observable(),
		emd: Observable()
	};

var usage = {
		top: Observable(),
		middle: Observable(),
		bottom: Observable()
	};

var condition;
var showPanel = {
	base: Observable(false),
	sido: Observable("0"),
	sgk: Observable("0"),
	emd: Observable("0"),
	usageTop: Observable("0"),
	usageMiddle: Observable("0"),
	usageBottom: Observable("0")
};

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

// 날짜를 온비드 형식에 맞추어 반환
function callDate(year, month, date) {
	month += 1;

	if (month < 10) {
		month = "0" + month;
	}
	if (date < 10) {
		date = "0" + date;
	}

	return "" + year + month + date;
}

function checkCondition() {
// 타입 선택에 따른 condition 추가
	if (selected.sellType.value == "전체") {
		condition = "" + "&DPSL_MTD_CD=ALL";
	} else if (selected.sellType.value == "매각") {
		condition = "" + "&DPSL_MTD_CD=0001";
	} else if (selected.sellType.value == "임대") {
		condition = "" + "&DPSL_MTD_CD=0002";
	}

// 시간 설정을 위한 Date 변수 추가
	var date = new Date();

// 기간 선택에 따른 condition 추가
	if (selected.date.value == "7일 이내") {
		condition += "&PBCT_BEGN_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());

		date.setDate(date.getDate()+7);
		condition += "&PBCT_CLS_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());
	} else if (selected.date.value == "30일 이내") {
		condition += "&PBCT_BEGN_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());

		date.setDate(date.getDate()+30);
		condition += "&PBCT_CLS_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());
	}
// 주소 선택에 따른 condition 추가
	if (selected.emd.value != "읍면동") {
		condition += "&EMD=" + selected.emd.value;
	}
	if (selected.sgk.value != "시군구") {
		condition += "&SGK=" + selected.sgk.value;
	}
	if (selected.emd.value != "시도") {
		condition += "&SIDO=" + selected.sido.value;
	}

	console.log(selected.assetType.value);
}

// 검색조건을 저장하는 함수
function conditionSave() {
	checkCondition();
// condition 저장.
	Storage.write("condition.txt", condition)
		.then(function(succeeded) {
	        if(succeeded) {
				console.log("Successfully wrote condition to file.");
			} else {
				console.log("Couldn't write condition to file.");
			}
		});
}

// 온비드에서 물건 검색하는 함수
function searchData() {
	checkCondition();

// 검색 url
	var url = "http://openapi.onbid.co.kr/openapi/services/KamcoPblsalThingInquireSvc/getKamcoSaleList?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D" + condition;

	showItems.clear()
	Backend.getData(url).then(function(items) {
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
	selected.sgk.replaceAll(["시군구"]);
	selected.emd.replaceAll(["읍면동"]);

	showPanel.base.value = !showPanel.base.value;
	showPanel.sido.value = "0";
}
//시도 구역 받아오기
function getSido() {
	var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidAddr1Info?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999';

	address.sido.clear();
	showPanel.base.value = !showPanel.base.value;
	showPanel.sido.value = "0.9";

	if (address.sido.length == 0) {
		Backend.getData(url).then(function(code) {
			code.response.body.items.forEach(function(item) {
				address.sido.add(item.item.ADDR1);
			});
			address.sido.removeRange(0, 1);
		});
	}
}
//시군구 구역 선택
function selectSgk(arg) {
	selected.emd.replaceAll(["읍면동"]);

	showPanel.base.value = !showPanel.base.value;
	showPanel.sgk.value = "0";
}
//시군구 구역 받아오기
function getSgk() {
	if (selected.sido.value != "시도") {
		var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidAddr2Info?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999&ADDR1='+encodeURI(selected.sido.value);

		address.sgk.clear();
		showPanel.base.value = !showPanel.base.value;
		showPanel.sgk.value = "0.9";

		if (address.sgk.length == 0) {
			Backend.getData(url).then(function(code) {
				code.response.body.items.forEach(function(item) {
					address.sgk.add(item.item.ADDR2);
				});
			});
		}
	}
}
//읍면동 구역 선택
function selectEmd(arg) {
	showPanel.base.value = !showPanel.base.value;
	showPanel.emd.value = "0";
}
//읍면동 구역 받아오기
function getEmd() {
	if (selected.sgk.value != "시군구") {
		var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidAddr3Info?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999&ADDR2='+encodeURI(selected.sgk.value);

		address.emd.clear();
		showPanel.base.value = !showPanel.base.value;
		showPanel.emd.value = "0.9";

		if (address.emd.length == 0) {
			Backend.getData(url).then(function(code) {
				code.response.body.items.forEach(function(item) {
					address.emd.add(item.item.ADDR3);
				});
			});
		}
	}
}

function selectUsageTop(arg) {
	selected.usageMiddle.replaceAll(["전체"]);
	selected.usageBottom.replaceAll(["전체"]);

	showPanel.base.value = !showPanel.base.value;
	showPanel.usageTop.value = "0";
}

function getUsageTop() {
	var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidTopCodeInfo?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999';

	usage.top.clear();
	showPanel.base.value = !showPanel.base.value;
	showPanel.usageTop.value = "0.9";

	if (usage.top.length == 0) {
		Backend.getData(url).then(function(code) {
			code.response.body.items.forEach(function(item) {
				usage.top.add(item.item);
			});
			code.response.body.items.forEach(function(item) {
				options.usageTop.add(item.item.CTGR_NM);
			});
		});
	}
}

function selectUsageMiddle(arg) {
	selected.usageBottom.replaceAll(["전체"]);

	showPanel.base.value = !showPanel.base.value;
	showPanel.usageMiddle.value = "0";
}

function getUsageMiddle() {
	if (selected.usageTop.value != "전체") {
		usage.top.forEach(function(item) {
			if (item.CTRM_NM == selected.usageTop.value) {
				console.log(item.CTGR_ID);
			}
		})
		
		var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidMiddleCodeInfo?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999&CTGR_ID='+selected.usageTop.value;

		usage.middle.clear();
		showPanel.base.value = !showPanel.base.value;
		showPanel.usageMiddle.value = "0.9";

		if (usage.middle.length == 0) {
			Backend.getData(url).then(function(code) {
				code.response.body.items.forEach(function(item) {
					usage.middle.add(item.item.CTGR_NM);
				});
			});
		}
	}
}

function selectUsageBottom(arg) {
	showPanel.base.value = !showPanel.base.value;
	showPanel.usageBottom.value = "0";
}

function getUsageBottom() {
	if (selected.usageMiddle.value != "전체") {
		var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidBottomCodeInfo?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999&CTGR_ID='+selected.usageMiddle.value;

		usage.bottom.clear();
		showPanel.base.value = !showPanel.base.value;
		showPanel.usageMiddle.value = "0.9";

		if (usage.Bottom.length == 0) {
			Backend.getData(url).then(function(code) {
				code.response.body.items.forEach(function(item) {
					usage.Bottom.add(item.item.CTGR_NM);
				});
			});
		}
	}
}

function closePanel() {
	showPanel.base.value = !showPanel.base.value;
	showPanel.sido.value = "0";
	showPanel.sgk.value = "0";
	showPanel.emd.value = "0";
}

module.exports = {
	searchData, conditionSave, checkCondition,

	showItems,

	options, selected,

	address, selectSido, selectSgk, selectEmd, getSido, getSgk, getEmd,

	usage, getUsageTop, getUsageMiddle, getUsageBottom, selectUsageTop, selectUsageBottom, selectUsageBottom,

	showPanel, closePanel,

	goDetail: function(arg) {
		router.push("detailData", arg.data.item);
	},
	goBack: function() {
		router.goBack();
	}
};