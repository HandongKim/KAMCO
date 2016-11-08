var Observable = require('FuseJS/Observable');
var Backend = require("Module/Backend.js");
var condition;
var param;
var totalCount = Observable(0);
var pageNo = 1;
var showItems = Observable();

this.Parameter.onValueChanged(function(x) {
	condition = x;
	searchData();
})

function checkCondition() {
// 타입 선택에 따른 param 추가
	param = "";
	if (condition.sellType == "매각") {
		param = "&DPSL_MTD_CD=0001";
	} else if (condition.sellType == "임대") {
		param = "&DPSL_MTD_CD=0002";
	}

// 기간 선택에 따른 param 추가
	if (condition.bgDate != null) {
		param += "&PBCT_BEGN_DTM=" + condition.bgDate;
		param += "&PBCT_CLS_DTM=" + condition.clsDate;
	}

// 주소 선택에 따른 param 추가
	if (condition.emd != "읍면동") {
		param += "&EMD=" + encodeURI(condition.emd);
	}
	if (condition.sgk != "시군구") {
		param += "&SGK=" + encodeURI(condition.sgk);
	}
	if (condition.emd != "시도") {
		param += "&SIDO=" + encodeURI(condition.sido);
	}

// 물건 종류에 따른 param 추가
	if (condition.usage.indexOf("전체") == -1) {
		if (condition.usage.indexOf("부동산") != -1) {
			param += "&CTGR_ID=10000";
		}
		if (condition.usage.indexOf("자동차") != -1) {
			param += "&CTGR_ID=12000";
		}
		if (condition.usage.indexOf("물품") != -1) {
			param += "&CTGR_ID=13000&CTGR_ID=14000&CTGR_ID=15000&CTGR_ID=16000&CTGR_ID=17000&CTGR_ID=18000&CTGR_ID=19000&CTGR_ID=20000&CTGR_ID=21000&CTGR_ID=22000&CTGR_ID=23000&CTGR_ID=24000&CTGR_ID=25000&CTGR_ID=26000&CTGR_ID=27000&CTGR_ID=28000&CTGR_ID=29000&CTGR_ID=30000";
		}
		if (condition.usage.indexOf("권리") != -1) {
			param += "&CTGR_ID=11000";
		}
		if (condition.usage.indexOf("기타") != -1) {
			param += "&CTGR_ID=31000";
		}
	}
}

// 온비드에서 물건 검색하는 함수
function searchData() {
	checkCondition();

// 검색 url
	var url = "http://openapi.onbid.co.kr/openapi/services/KamcoPblsalThingInquireSvc/getKamcoSaleList?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D" + param;

	showItems.clear();
	Backend.getData(url).then(function(items) {
		totalCount.value = items.response.body.totalCount;
		pageNo = 1;
		showItems.add(items.response.body.items[0]);
		for (var i = 1 ; i < items.response.body.items.length ; i++) {
			if (items.response.body.items[i].item.PLNM_NO != showItems.toArray()[showItems.length-1].item.PLNM_NO) {
				showItems.add(items.response.body.items[i]);
			}
		}
	});
}

function loadMore() {
	if(totalCount.value > pageNo*10) {
		checkCondition();

		for(var j = 0; j < 5; j++) {
			pageNo++;
			var url = "http://openapi.onbid.co.kr/openapi/services/KamcoPblsalThingInquireSvc/getKamcoSaleList?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D" + param + "&pageNo=" + pageNo;

			Backend.getData(url).then(function(items) {
				for (var i = 0 ; i < items.response.body.items.length ; i++) {
					if (items.response.body.items[i].item.PLNM_NO != showItems.toArray()[showItems.length-1].item.PLNM_NO) {
						showItems.add(items.response.body.items[i]);
					}
				}
			});
		}
	}
}

// 보여주는 물건을 정렬해주는 함수.
function sortItems() {
	var tempItems = [];
	showItems.forEach(function(item) {
		tempItems.push(item);
	});

	showItems.clear();
	tempItems.sort(function (a, b) {
		return parseFloat(a.item.MIN_BID_PRC) - parseFloat(b.item.MIN_BID_PRC);
	});

	for (var i = 0 ; i < tempItems.length ; i++) {
		showItems.add(tempItems[i]);
	}
}

function goDetail(arg) {
	router.push("detailData", arg.data.item);
}

module.exports = {
	totalCount, sortItems, showItems, goDetail, loadMore,
	goConditionSetting: function(){
		router.push("conditionSetting");
	},
	goBack: function() {
		router.goBack();
	}
};