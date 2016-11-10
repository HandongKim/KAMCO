var Observable = require('FuseJS/Observable');
var Storage = require('FuseJS/Storage');
var Backend = require("Module/Backend.js");

var item = {basicItem: this.Parameter, detailItem: Observable()};
var saveItems = [];
var showItem = Observable();
var options = ["기본정보", "기관정보", "공고정보", "경매정보", "공고문", "입찰정보"];
var selected = Observable("기본정보");
var panel = {
		basic: {Opacity: Observable("1"), ZOffset: Observable("0")},
		onbid: {Opacity: Observable("0"), ZOffset: Observable("0")},
		notice: {Opacity: Observable("0"), ZOffset: Observable("0")},
		auction: {Opacity: Observable("0"), ZOffset: Observable("0")},
		noticeText: {Opacity: Observable("0"), ZOffset: Observable("0")},
		date: {Opacity: Observable("0"), ZOffset: Observable("0")}
	};

this.Parameter.onValueChanged(function(x) {
	var url = "http://openapi.onbid.co.kr/openapi/services/KamcoPblsalThingInquireSvc/getKamcoSaleDetail?ServiceKey=LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D&PLNM_NO="+item.basicItem.value.PLNM_NO+"&PBCT_NO="+item.basicItem.value.PBCT_NO;

	showItem.clear();
	for (var o in item.basicItem.value ) {
		if (item.basicItem.value[o] != "") {
			showItem.add({name: Backend.changeAttributeName(o), contents: item.basicItem.value[o] });
		}
	}

	Backend.getData(url).then(function(item) {
		item.detailItem.value = item;
	});

	Storage.read("saveItems.txt").then(function(data) {
		var temp = JSON.parse(data);
		console.log(JSON.stringify(temp));
		temp.forEach(function(item) {
			saveItems.add(item);
		})
	});
});

function clearPanel(data) {
	for (o in panel) {
		panel[o].Opacity.value = "0";
		panel[o].ZOffset.value = "0";
	}
}

function selectData() {
	clearPanel();
	switch (selected.value) {
		case '기본정보':
			panel.basic.Opacity.value = "1";
			panel.basic.ZOffset.value = "1";
			break;
		case '기관정보':
			panel.onbid.Opacity.value = "1";
			panel.onbid.ZOffset.value = "1";
			break;
		case '공고정보':
			panel.notice.Opacity.value = "1";
			panel.notice.ZOffset.value = "1";
			break;
		case '경매정보':
			panel.auction.Opacity.value = "1";
			panel.auction.ZOffset.value = "1";
			break;
		case '공고문':
			panel.noticeText.Opacity.value = "1";
			panel.noticeText.ZOffset.value = "1";
			break;
		case '입찰정보':
			panel.date.Opacity.value = "1";
			panel.date.ZOffset.value = "1";
			break;
	}
}

function save() {
//	console.log(JSON.stringify(item.basicItem.value));
	var temp = item.basicItem.value;
	saveItems.push(temp);
	Storage.write("saveItems.txt", JSON.stringify(saveItems))
		.then(function(succeeded) {
			if(succeeded) {
				console.log("Successfully wrote to file.");
			} else {
				console.log("Couldn't write to file.");
			}
		})
}

module.exports = {
	item,
	showItem,
	options,
	selected,
	panel,
	selectData,
	save,
	goBack: function() {
		router.goBack();
	}
};