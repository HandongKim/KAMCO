var Observable = require('FuseJS/Observable');
var Storage = require('FuseJS/Storage');
var Backend = require("Module/Backend.js");

var data = this.Selected.inner();

var condition = data.map(function(item){
	return {
		sellType: item.sellType,
		date: item.date,
		assetType: item.assetType,
		sido: item.sido,
		sgk: item.sgk,
		emd: item.emd,
		usageTop: item.usageTop,
		usageMiddle: item.usageMiddle,
		usageBottom: item.usageBottom
	}
});

var options = {
	sellType:["전체", "매각", "임대"],
	date: ["7일 이내", "30일 이내"],
	assetType: [
		{name: "캠코\n압류", selected: Observable(false)},
		{name: "캠코\n국유", selected: Observable(false)},
		{name: "캠코\n수탁", selected: Observable(false)},
		{name: "캠코\n유입", selected: Observable(false)},
		{name: "이용\n기관", selected: Observable(false)}
	],
	sido: Observable(),
	sgk: Observable(),
	emd: Observable(),
	usageTop: Observable(),//picker내에 보이는 문자열 저장 변수
	usageMiddle: Observable(),
	usageBottom: Observable()
};

var usage = {
		top: Observable(),//picker에서 선택한 문자를 비교하여 반환하기 위해 필요한 변수
		middle: Observable(),
		bottom: Observable()
	};

var showPanel = {
	base: Observable(false),
	sido: Observable("0"),
	sgk: Observable("0"),
	emd: Observable("0"),
	usageTop: Observable("0"),
	usageMiddle: Observable("0"),
	usageBottom: Observable("0")
};

var conditions = {
	condition1: {
		sellType: "",
		bgDate: "",
		clsDate: "",
		assetType: "",
		sido: "",
		sgk: "",
		emd: "",
		usageTop: "",
		usageMiddle: "",
		usageBottom: ""
	},
	condition2: {
		sellType: "",
		bgDate: "",
		clsDate: "",
		assetType: "",
		sido: "",
		sgk: "",
		emd: "",
		usageTop: "",
		usageMiddle: "",
		usageBottom: ""
	},
	condition3: {
		sellType: "",
		bgDate: "",
		clsDate: "",
		assetType: "",
		sido: "",
		sgk: "",
		emd: "",
		usageTop: "",
		usageMiddle: "",
		usageBottom: ""
	},
	condition4: {
		sellType: "",
		bgDate: "",
		clsDate: "",
		assetType: "",
		sido: "",
		sgk: "",
		emd: "",
		usageTop: "",
		usageMiddle: "",
		usageBottom: ""
	}
};

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

// 검색조건을 저장하는 함수
function saveCondition() {
	conditions.condition1.sellType = condition.sellType.value;
	var date = new Date();
	if (condition.date.value == "7일 이내") {
		conditions.condition1.bgDate = callDate(date.getFullYear(), date.getMonth(), date.getDate());

		date.setDate(date.getDate()+7);
		conditions.condition1.clsDate = callDate(date.getFullYear(), date.getMonth(), date.getDate());
	} else if (condition.date.value == "30일 이내") {
		conditions.condition1.bgDate = callDate(date.getFullYear(), date.getMonth(), date.getDate());

		date.setDate(date.getDate()+30);
		conditions.condition1.clsDate = callDate(date.getFullYear(), date.getMonth(), date.getDate());
	}
	options.assetType.forEach(function(data) {
		if(data.selected.value == true) {
			conditions.condition1.assetType += data.name;
		}
	});
	conditions.condition1.sido = condition.sido.value;
	conditions.condition1.sgk = condition.sgk.value;
	conditions.condition1.emd = condition.emd.value;
	conditions.condition1.usageTop = condition.usageTop.value;
	conditions.condition1.usageMiddle = condition.usageMiddle.value;
	conditions.condition1.usageBottom = condition.usageBottom.value;

	console.log(JSON.stringify(conditions.condition1));
// condition 저장.
	Storage.write("conditions.txt", JSON.stringify(conditions))
		.then(function(succeeded) {
	        if(succeeded) {
				console.log("Successfully wrote condition to file.");
			} else {
				console.log("Couldn't write condition to file.");
			}
		});
}

//시도 구역 선택
function selectSido(arg) {
	condition.value.sgk.value = "시군구";
	condition.value.emd.value = "읍면동";
	showPanel.base.value = !showPanel.base.value;
	showPanel.sido.value = "0";
}
//시도 구역 받아오기
function getSido() {
	var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidAddr1Info?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999';

	options.sido.clear();
	showPanel.base.value = !showPanel.base.value;
	showPanel.sido.value = "0.9";

	if (options.sido.length == 0) {
		Backend.getData(url).then(function(code) {
			code.response.body.items.forEach(function(item) {
				options.sido.add(item.item.ADDR1);
			});
			options.sido.removeRange(0, 1);
		});
	}
}
//시군구 구역 선택
function selectSgk(arg) {
	condition.value.emd.value = "읍면동";
	showPanel.base.value = !showPanel.base.value;
	showPanel.sgk.value = "0";
}
//시군구 구역 받아오기
function getSgk() {
	if (condition.value.sido.value != "시도") {
		var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidAddr2Info?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999&ADDR1='+encodeURI(condition.value.sido.value);

		options.sgk.clear();
		showPanel.base.value = !showPanel.base.value;
		showPanel.sgk.value = "0.9";

		if (options.sgk.length == 0) {
			Backend.getData(url).then(function(code) {
				code.response.body.items.forEach(function(item) {
					options.sgk.add(item.item.ADDR2);
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
	if (condition.value.sgk.value != "시군구") {
		var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidAddr3Info?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999&ADDR2='+encodeURI(condition.value.sgk.value);

		options.emd.clear();
		showPanel.base.value = !showPanel.base.value;
		showPanel.emd.value = "0.9";

		if (options.emd.length == 0) {
			Backend.getData(url).then(function(code) {
				code.response.body.items.forEach(function(item) {
					options.emd.add(item.item.ADDR3);
				});
			});
		}
	}
}

function selectUsageTop(arg) {
	condition.value.usageMiddle.value = "용도1";
	condition.value.usageBottom.value = "용도3";
	showPanel.base.value = !showPanel.base.value;
	showPanel.usageTop.value = "0";
}

function getUsageTop() {
	var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidTopCodeInfo?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999';

	usage.top.clear();
	options.usageTop.clear();
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
	condition.value.usageBottom.value = "용도3";
	showPanel.base.value = !showPanel.base.value;
	showPanel.usageMiddle.value = "0";
}

function getUsageMiddle() {
	if (condition.value.usageTop.value != "전체") {
		var temp;
		usage.top.forEach(function(item) {
			//console.log(JSON.stringify(item.CTGR_NM));
			if (item.CTGR_NM === condition.value.usageTop.value) {
				temp = item.CTGR_ID;
			}
		})
		
		var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidMiddleCodeInfo?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999&CTGR_ID='+temp;

		usage.middle.clear();
		options.usageMiddle.clear();
		showPanel.base.value = !showPanel.base.value;
		showPanel.usageMiddle.value = "0.9";

		if (usage.middle.length == 0) {
			Backend.getData(url).then(function(code) {
				code.response.body.items.forEach(function(item) {
					usage.middle.add(item.item);
				});
				code.response.body.items.forEach(function(item) {
					options.usageMiddle.add(item.item.CTGR_NM);
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
	if (condition.value.usageMiddle.value != "전체") {
		var temp;
		usage.middle.forEach(function(item) {
			//console.log(JSON.stringify(item.CTGR_NM));
			if (item.CTGR_NM === condition.value.usageMiddle.value) {
				temp = item.CTGR_ID;
			}
		})

		var url = 'http://openapi.onbid.co.kr/openapi/services/OnbidCodeInfoInquireSvc/getOnbidBottomCodeInfo?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&numOfRows=999&CTGR_ID='+temp;

		usage.bottom.clear();
		showPanel.base.value = !showPanel.base.value;
		showPanel.usageBottom.value = "0.9";

		if (usage.bottom.length == 0) {
			Backend.getData(url).then(function(code) {
				code.response.body.items.forEach(function(item) {
					options.usageBottom.add(item.item.CTGR_NM);
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

function assetTypeSelect(arg) {
	arg.data.selected.value = ! arg.data.selected.value;
}

function check(){
	console.log(JSON.stringify(condition));
}

module.exports = {
	condition, options, showPanel, closePanel, check,

	selectSido, selectSgk, selectEmd, getSido, getSgk, getEmd,

	usage, getUsageTop, getUsageMiddle, getUsageBottom, selectUsageTop, selectUsageMiddle, selectUsageBottom,

	saveCondition, assetTypeSelect
};