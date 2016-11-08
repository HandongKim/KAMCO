var Observable = require('FuseJS/Observable');
var Storage = require('FuseJS/Storage');
var Backend = require("Module/Backend.js");

var condition = {
    sellType: Observable("전체"),
    date: Observable("7일 이내"),
    assetType: [
        {name: "캠코\n압류", selected: Observable(false)},
        {name: "캠코\n국유", selected: Observable(false)},
        {name: "캠코\n수탁", selected: Observable(false)},
        {name: "캠코\n유입", selected: Observable(false)},
        {name: "이용\n기관", selected: Observable(false)}
    ],
    sido: Observable("시도"),
    sgk: Observable("시군구"),
    emd: Observable("읍면동"),
    usage: [
		{name: "부동산", selected: Observable(false)},
		{name: "자동차", selected: Observable(false)},
		{name: "물품\n기계", selected: Observable(false)},
		{name: "권리\n증권", selected: Observable(false)},
		{name: "기타", selected: Observable(false)},
		{name: "전체", selected: Observable(false)}
    ]
/*    ,
    usageTop: Observable("용도1"),
    usageMiddle: Observable("용도2"),
    usageBottom: Observable("용도3")*/
};
var forChange = -1;

var conditions = [];
//저장된 검색조건을 불러옴.
Storage.read("conditions.txt").then(function(data) {
	var temp = JSON.parse(data);
	temp.forEach(function(item) {
		conditions.push(item);
	})
});

//검색조건 수정을 위한 저장된 파라메터 출력
this.Parameter.onValueChanged(function(x) {
	condition.sellType.value = x.sellType;
	if (x.clsDate - x.bgDate > 7) {
		condition.date.value = "30일 이내";
	} else {
		condition.date.value = "7일 이내";
	}
	if (x.assetType.indexOf("압류") != -1) {
		condition.assetType[0].selected.value = true;
	}
	if (x.assetType.indexOf("국유") != -1) {
		condition.assetType[1].selected.value = true;
	}
	if (x.assetType.indexOf("수탁") != -1) {
		condition.assetType[2].selected.value = true;
	}
	if (x.assetType.indexOf("유입") != -1) {
		condition.assetType[3].selected.value = true;
	}
	if (x.assetType.indexOf("기관") != -1) {
		condition.assetType[4].selected.value = true;
	}
	if (x.usage.indexOf("전체") != -1) {
		condition.usage[5].selected.value = true;
	} else {
		if (x.usage.indexOf("부동산") != -1) {
			condition.usage[0].selected.value = true;
		}
		if (x.usage.indexOf("자동차") != -1) {
			condition.usage[1].selected.value = true;
		}
		if (x.usage.indexOf("물품") != -1) {
			condition.usage[2].selected.value = true;
		}
		if (x.usage.indexOf("권리") != -1) {
			condition.usage[3].selected.value = true;
		}
		if (x.usage.indexOf("기타") != -1) {
			condition.usage[4].selected.value = true;
		}
	}
	condition.sido.value = x.sido;
	condition.sgk.value = x.sgk;
	condition.emd.value = x.emd;
/*	condition.usageTop.value = x.usageTop;
	condition.usageMiddle.value = x.usageMiddle;
	condition.usageBottom.value = x.usageBottom;*/
	forChange = x.number - 1;
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

function addCondition(i, sellType, bgDate, clsDate, assetType, sido, sgk, emd, usage){
	this.number = i;
	this.delay = (i-1) * 0.1;
	this.sellType = sellType;
	this.bgDate = bgDate;
	this.clsDate = clsDate;
	this.assetType = assetType;
	this.sido = sido;
	this.sgk = sgk;
	this.emd = emd;
	this.usage = usage;
/*	this.usageTop = usageTop;
	this.usageMiddle = usageMiddle;
	this.usageBottom = usageBottom;*/
}

// 검색조건을 저장하는 함수
function saveCondition() {
	var i = conditions.length;
	var bgDate, clsDate;
	var assetType = "";
	var usage = "";

	var date = new Date();
	if (condition.date.value == "7일 이내") {
		bgDate = callDate(date.getFullYear(), date.getMonth(), date.getDate());

		date.setDate(date.getDate()+7);
		clsDate = callDate(date.getFullYear(), date.getMonth(), date.getDate());
	} else if (condition.date.value == "30일 이내") {
		bgDate = callDate(date.getFullYear(), date.getMonth(), date.getDate());

		date.setDate(date.getDate()+30);
		clsDate = callDate(date.getFullYear(), date.getMonth(), date.getDate());
	}

	condition.assetType.forEach(function(data) {
		if(data.selected.value == true) {
			assetType += data.name;
		}
	});

	if(condition.usage[5].selected.value == true) {
		usage = "전체";
	} else {
		condition.usage.forEach(function(data) {
			if(data.selected.value == true) {
				usage += data.name;
			}
		});
	}

	if (forChange > -1) {
		conditions[forChange].sellType = condition.sellType.value;
		conditions[forChange].bgDate = bgDate;
		conditions[forChange].clsDate = clsDate;
		conditions[forChange].assetType = assetType;
		conditions[forChange].sido = condition.sido.value;
		conditions[forChange].sgk = condition.sgk.value;
		conditions[forChange].emd = condition.emd.value;
		conditions[forChange].usage = usage;
/*		conditions[forChange].usageTop = condition.usageTop.value;
		conditions[forChange].usageMiddle = condition.usageMiddle.value;
		conditions[forChange].usageBottom = condition.usageBottom.value;*/
	} else {
		conditions.push(new addCondition(i+1, condition.sellType.value, bgDate, clsDate, assetType, condition.sido.value, condition.sgk.value, condition.emd.value, usage));
	}

	console.log(JSON.stringify(conditions));
// condition 저장.
	Storage.write("conditions.txt", JSON.stringify(conditions))
		.then(function(succeeded) {
	        if(succeeded) {
				console.log("Successfully wrote condition to file.");
			} else {
				console.log("Couldn't write condition to file.");
			}
		});
	router.goBack();
}

module.exports = {
	condition, conditions,

	saveCondition,

	goBack: function() {
		router.goBack();
	}
};