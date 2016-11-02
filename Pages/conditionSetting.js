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
    usageTop: Observable("용도1"),
    usageMiddle: Observable("용도2"),
    usageBottom: Observable("용도3")
};

var conditions = [];
//저장된 검색조건을 불러옴.
Storage.read("conditions.txt").then(function(data) {
	var temp = JSON.parse(data);
	temp.forEach(function(item) {
		conditions.push(item);
	})
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

function addCondition(i, sellType, bgDate, clsDate, assetType, sido, sgk, emd, usageTop, usageMiddle, usageBottom){
	this.number = i;
	this.sellType = sellType;
	this.bgDate = bgDate;
	this.clsDate = clsDate;
	this.assetType = assetType;
	this.sido = sido;
	this.sgk = sgk;
	this.emd = emd;
	this.usageTop = usageTop;
	this.usageMiddle = usageMiddle;
	this.usageBottom = usageBottom;
}

// 검색조건을 저장하는 함수
function saveCondition() {
	var i = conditions.length;
	var bgDate, clsDate;
	var assetType = "";

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

	conditions.push(new addCondition(i+1, condition.sellType.value, bgDate, clsDate, assetType, condition.sido.value, condition.sgk.value, condition.emd.value, condition.usageTop.value, condition.usageMiddle.value, condition.usageBottom.value));

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
}

module.exports = {
	condition, conditions,

	saveCondition
};