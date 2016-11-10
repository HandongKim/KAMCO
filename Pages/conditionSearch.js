var Observable = require('FuseJS/Observable');
var Backend = require("Module/Backend.js");
var condition = Observable();
var param;
var totalCount = Observable(0);
var pageNo = 1;
var showItems = Observable();
var keyword = Observable("");

this.Parameter.onValueChanged(function(x) {
	condition.value = x;
	searchData();
})

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
// 타입 선택에 따른 param 추가
	param = "";
	if (condition.value.sellType == "매각") {
		param = "&DPSL_MTD_CD=0001";
	} else if (condition.value.sellType == "임대") {
		param = "&DPSL_MTD_CD=0002";
	}

// 기간 선택에 따른 param 추가
	var date = new Date();
	if (condition.value.date == "7일 이내") {
		param += "&PBCT_BEGN_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());

		date.setDate(date.getDate()+7);
		param += "&PBCT_CLS_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());
	} else if (condition.value.date == "30일 이내") {
		param += "&PBCT_BEGN_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());

		date.setDate(date.getDate()+30);
		param += "&PBCT_CLS_DTM=" + callDate(date.getFullYear(), date.getMonth(), date.getDate());
	}

// 주소 선택에 따른 param 추가
	if (condition.value.emd != "전체") {
		param += "&EMD=" + encodeURI(condition.value.emd);
	}
	if (condition.value.sgk != "전체") {
		param += "&SGK=" + encodeURI(condition.value.sgk);
	}
	if (condition.value.sido != "전체") {
		param += "&SIDO=" + encodeURI(condition.value.sido);
	}

// 물건 종류에 따른 param 추가
	for (var i = 0 ; i < 6 ; i++) {
		if(condition.value.usage[i].selected == true && i == 0) { param += "&CTGR_HIRK_ID=10000"; }
		if(condition.value.usage[i].selected == true && i == 1) { param += "&CTGR_HIRK_ID=12000"; }
		if(condition.value.usage[i].selected == true && i == 2) { param += "&CTGR_HIRK_ID=13000&CTGR_ID=14000&CTGR_ID=15000&CTGR_ID=16000&CTGR_ID=17000&CTGR_ID=18000&CTGR_ID=19000&CTGR_ID=20000&CTGR_ID=21000&CTGR_ID=22000&CTGR_ID=23000&CTGR_ID=24000&CTGR_ID=25000&CTGR_ID=26000&CTGR_ID=27000&CTGR_ID=28000&CTGR_ID=29000&CTGR_ID=30000"; }
		if(condition.value.usage[i].selected == true && i == 3) { param += "&CTGR_HIRK_ID=11000"; }
		if(condition.value.usage[i].selected == true && i == 4) { param += "&CTGR_HIRK_ID=31000"; }
	}
// 입찰 가격에 따른 param 추가
	if (condition.value.minPrice != null) {
		param += "&OPEN_PRICE_FROM=" + condition.value.minPrice;
	}
	if (condition.value.maxPrice != null) {
		param += "&OPEN_PRICE_TO=" + condition.value.maxPrice;
	}

// 자산 구분에 따른 param 추가
}

// 온비드에서 물건 검색하는 함수
function searchData() {
	checkCondition();

// 검색 url
	var url = "http://openapi.onbid.co.kr/openapi/services/KamcoPblsalThingInquireSvc/getKamcoSaleList?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D" + param;

	showItems.clear();
//	console.log(url);
	Backend.getData(url).then(function(items) {
		totalCount.value = items.response.body.totalCount;
		pageNo = 1;
		if(totalCount.value != 0) {
			showItems.add(items.response.body.items[0]);
		
			for (var i = 1 ; i < items.response.body.items.length ; i++) {
				var check = true;
				for (var j = 0 ; j < showItems.length ; j++) {
					if (items.response.body.items[i].item.CLTR_NO == showItems.toArray()[j].item.CLTR_NO) {
						check = false;
					}
				}
				
				if (check == true) {
					showItems.add(items.response.body.items[i]);
				}
			}
		}
	});
}

function loadMore() {
	if(totalCount.value > pageNo*10) {
		checkCondition();

		for(var j = 0; j < 3; j++) {
			pageNo++;
			var url = "http://openapi.onbid.co.kr/openapi/services/KamcoPblsalThingInquireSvc/getKamcoSaleList?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D" + param + "&pageNo=" + pageNo;

			Backend.getData(url).then(function(items) {
				for (var i = 0 ; i < items.response.body.items.length ; i++) {
					var check = true;
					for (var j = 0 ; j < showItems.length ; j++) {
						if (items.response.body.items[i].item.CLTR_NO == showItems.toArray()[j].item.CLTR_NO) {
							check = false;
						}
					}
					
					if (check == true) {
						showItems.add(items.response.body.items[i]);
					}
				}
			});
		}
	}
}

// 보여주는 물건을 정렬해주는 함수.
function sortLowPrice() {
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

function sortHighPrice() {
	var tempItems = [];
	showItems.forEach(function(item) {
		tempItems.push(item);
	});

	showItems.clear();
	tempItems.sort(function (a, b) {
		return parseFloat(b.item.MIN_BID_PRC) - parseFloat(a.item.MIN_BID_PRC);
	});

	for (var i = 0 ; i < tempItems.length ; i++) {
		showItems.add(tempItems[i]);
	}
}

function sortLowRate() {
	var tempItems = [];
	showItems.forEach(function(item) {
		tempItems.push(item);
	});

	showItems.clear();
	tempItems.sort(function (a, b) {
		return parseFloat(a.item.FEE_RATE.replace("(", "").replace(")", "")) - parseFloat(b.item.FEE_RATE.replace("(", "").replace(")", ""));
	});

	for (var i = 0 ; i < tempItems.length ; i++) {
		showItems.add(tempItems[i]);
	}
}

function sortHighRate() {
	var tempItems = [];
	showItems.forEach(function(item) {
		tempItems.push(item);
	});

	showItems.clear();
	tempItems.sort(function (a, b) {
		return parseFloat(b.item.FEE_RATE.replace("(", "").replace(")", "")) - parseFloat(a.item.FEE_RATE.replace("(", "").replace(")", ""));
	});

	for (var i = 0 ; i < tempItems.length ; i++) {
		showItems.add(tempItems[i]);
	}
}

function keywordSearch() {
	var tempItems = [];
	showItems.forEach(function(item) {
//		console.log(JSON.stringify(item));
		for (var o in item.item) {
			if (item.item[o].indexOf(keyword.value) != -1) {
				console.log(item.item[o]);
				tempItems.push(item);
				break;
			}
		}
	});

	showItems.clear();
	for (var i = 0 ; i < tempItems.length ; i++) {
		showItems.add(tempItems[i]);
	}
}

function goDetail(arg) {
	router.push("detailData", arg.data.item);
}

module.exports = {
	totalCount, showItems, goDetail, loadMore, condition, keyword,
	sortLowPrice, sortHighPrice, sortLowRate, sortHighRate, keywordSearch,
	goConditionSetting: function(){
		router.push("conditionSetting");
	},
	goBack: function() {
		router.goBack();
	}
};