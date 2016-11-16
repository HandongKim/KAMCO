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
	sido: Observable("전체"),
	sgk: Observable("전체"),
	emd: Observable("전체"),
	usage: [
		{name: "부동산", selected: Observable(false)},
		{name: "자동차", selected: Observable(false)},
		{name: "물품\n기계", selected: Observable(false)},
		{name: "권리\n증권", selected: Observable(false)},
		{name: "기타", selected: Observable(false)},
		{name: "전체", selected: Observable(false)}
	],
	minPrice: Observable(""),
	maxPrice: Observable("")
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
	condition.date.value = x.date;
	for (var i = 0 ; i < 5 ; i++) {
		condition.assetType[i].selected.value = x.assetType[i].selected;
	}
	for (var i = 0 ; i < 6 ; i++) {
		condition.usage[i].selected.value = x.usage[i].selected;
	}
	condition.sido.value = x.sido;
	condition.sgk.value = x.sgk;
	condition.emd.value = x.emd;
	condition.minPrice.value = x.minPrice;
	condition.maxPrice.value = x.maxPrice;
	forChange = x.number - 1;
})

// 검색조건을 저장하는 함수
function saveCondition() {
	conditions[forChange].sellType = condition.sellType.value;
	conditions[forChange].date = condition.date.value;
	for(var j = 0 ; j < 5 ; j++) {
		conditions[forChange].assetType[j].selected = condition.assetType[j].selected.value;
	}
	conditions[forChange].sido = condition.sido.value;
	conditions[forChange].sgk = condition.sgk.value;
	conditions[forChange].emd = condition.emd.value;
	for(var j = 0 ; j < 6 ; j++) {
		conditions[forChange].usage[j].selected = condition.usage[j].selected.value;
	}
	conditions[forChange].minPrice = condition.minPrice.value;
	conditions[forChange].maxPrice = condition.maxPrice.value;
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