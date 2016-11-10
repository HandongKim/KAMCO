var Observable = require('FuseJS/Observable');

var key = "LEVQhgclvGUKoC%2BJrvokKajzK6OsTFRinprds4qBzZj1PJMDZUQ8SRTm0lmzbj1jzC9IaZLqEm1G%2FhAdHV5R5A%3D%3D";

function parsingXMLData(xmlData) {
	var jsonString = "{}"; // json데이터를 생성하기 위한 문자열을 저장할 변수
	var findLocation = 0; // 데이터를 찾기 시작할 위치를 저장할 변수
	var insertLocation = 1; // 데이터의 삽입 위치를 저장할 변수
	var deepCount = 1; // json 데이터의 깊이를 저장할 변수
	var attribute = Observable(); // xml 속성을 저장할 변수

// xml헤더 내용과 불필요한 부분을 삭제.
	var forDeleteText = findString(xmlData, findLocation);
	xmlData = xmlData.replace('<'+forDeleteText+'>', "").replace(/\t/g, "").replace(/\r/g, "").replace(/\n/g, "\\n").replace(/\s\s+/g, "");

// < 의 개수만큼 반복하며 json데이터의 속성들을 추가.
	for (var i = 0 ; i < xmlData.match(/</g).length ; i++) {
		var first;

		forDeleteText = findString(xmlData, findLocation+1);
		first = xmlData.indexOf('/'+forDeleteText, findLocation+1);
		
		if (forDeleteText == findString(xmlData, first+1)) {
			if (attribute.indexOf(forDeleteText) == -1) {
				attribute.add(forDeleteText);
			}
		}
		findLocation = xmlData.indexOf("<", findLocation+1);
	}

	findLocation = 0;

// < 의 개수만큼 반복하며 json데이터문자열에 속성값을 찾아 추가.
	for (var i = 0 ; i < xmlData.match(/</g).length ; i++) {
		//문자열을 반환하는 함수 findString()
		forDeleteText = findString(xmlData, findLocation+1);

		if (forDeleteText.indexOf("/") == -1) {
			var forInsertText = findDataString(xmlData, forDeleteText, findLocation);
			
			var findInsertLocation = "";
			for (var j = 0 ; j < deepCount ; j++) {
				findInsertLocation = findInsertLocation + "}";
			}

			for (var j = 0 ; j < jsonString.length ; ) {
				j = jsonString.indexOf(findInsertLocation, j+1);
				if (jsonString.indexOf(findInsertLocation, j+1) < 0) {
					insertLocation = j;
					break;
				}
			}

			if (forInsertText.indexOf("<") < 0) {
				jsonString =
					jsonString.substring(0, insertLocation)
					+'"'+forDeleteText+'":"'+forInsertText+'", '
					+jsonString.substring(insertLocation, jsonString.length);

				insertLocation = insertLocation+forDeleteText.length+forInsertText.length+5;
			} else {
				jsonString =
					jsonString.substring(0, insertLocation)
					+'"'+forDeleteText+'":{}'
					+jsonString.substring(insertLocation, jsonString.length);
			}
			deepCount++;
		} else if(forDeleteText.indexOf("/") > 1) {
			jsonString =
				jsonString.substring(0, insertLocation)
				+'"'+forDeleteText+'":"", '
				+jsonString.substring(insertLocation, jsonString.length);
		} else {
			deepCount--;
		}

		findLocation = xmlData.indexOf("<", findLocation+1);
	}

// json데이터문자열에 불필요한 부분 제거.
	jsonString = jsonString
		.replace(/, }/g, "}")
		.replace(/}"/g, '}, "');

	findLocation = 0;

// json데이터문자열에 중복된 속성이 있다면 그 속성들을 []으로 감싸줌.
	for (var i = 0 ; i < attribute.length ; i++) {
		var frontAttribute, backAttribute, findText, modifyText;
		findText = attribute.getAt(i);
		for (var j = 0 ; j<xmlData.match(/</g).length ; j++) {
			frontAttribute = findString(xmlData, findLocation+1);
			findLocation = xmlData.indexOf("<", findLocation+1);

			if(findString(xmlData, findLocation+1) == findText) {
				break;
			}
		}
		findLocation = 0;

		findLocation = xmlData.indexOf('/'+frontAttribute, 0);
		backAttribute = findString(xmlData, findLocation+1);

		modifyText = '}, {"' + findText + '"';
		findText = new RegExp(', "'+findText+'"', 'g');

		jsonString = jsonString
			.replace('"'+frontAttribute+'":{', '"'+frontAttribute+'":[{')
			.replace('}}, "'+backAttribute, '}}], "'+backAttribute)
			.replace(findText, modifyText);
	}

// 문자열을 json 데이터로 반환.
	return JSON.parse(jsonString);
}

// < 와 > 사이의 문자열을 찾는 함수.
function findString(data, location) {
	var start, end;
	start = data.indexOf('<', location);
	end = data.indexOf('>', start);
	
	return data.substring(start+1, end);
}

// data1 안에 있는 data2 값을 findlocation부터 검색해서 데이터 값을 찾는 함수.
function findDataString(data1, data2, findLocation) {
	var start, end;
	start = data1.indexOf(data2, findLocation);
	end = data1.indexOf('</'+data2, start);
	
	return data1.substring(start+1+data2.length, end);
}

// 속성 이름을 한글로 변경하는 함수
function changeAttributeName(name) {
	var forChange = {
		"DPSL_MTD_CD": "처분방식코드",
		"CTGR_HIRK_ID":  "카테고리 상위ID",
		"CTGR_HRIK_ID_MID": "카테고리 상위ID(중간)",
		"SIDO": "시도",
		"SGK": "시군구",
		"EMD": "읍면동",
		"GOODS_PRICE_FROM": "감정가 하한",
		"GOODS_PRICE_TO": "감정가 상한",
		"OPEN_PRICE_FROM": "최저입찰가 하한",
		"OPEN_PRICE_TO": "최저입찰가 상한",
		"PLNM_NO": "공고번호",
		"PBCT_NO": "공매번호",
		"PBCT_CDTN_NO": "공매조건번호",
		"CLTR_NO": "물건번호",
		"CLTR_HSTR_NO": "물건이력번호",
		"SCRN_GRP_CD": "화면그룹코드",
		"CTGR_FULL_NM": "용도명",
		"BID_MNMT_NO": "입찰번호",
		"CLTR_NM": "물건명",
		"CLTR_MNMT_NO": "물건관리번",
		"LDNM_ADRS": "물건소재지 (지번)",
		"NMRD_ADRS": "물건소재지 (도로명)",
		"DPSL_MTD_NM": "처분방식코드명",
		"BID_MTD_NM": "입찰방식명",
		"MIN_BID_PRC": "최저입찰가",
		"APSL_ASES_AVG_AMT": "감정가",
		"FEE_RATE": "최저입찰가율",
		"PBCT_BEGN_DTM": "입찰시작일시",
		"PBCT_CLS_DTM": "입찰마감일시",
		"PBCT_CLTR_STAT_NM": "물건상태",
		"USCBD_CNT": "유찰횟수",
		"IQRY_CNT": "조회수",
		"GOODS_NM": "물건상세정보",
		"MANF": "제조사",
		"MDL": "모델",
		"NRGT": "연월식",
		"GRBX": "변속기",
		"ENDPC": "배기량",
		"VHCL_MLGE": "주행거리",
		"FUEL": "연료",
		"SCRT_NM": "법인명",
		"TPBZ": "업종",
		"ITM_NM": "종목명",
		"MMB_RGT_NM": "회원권명"
	};

	for (var o in forChange ) {
		if (o == name) {
			return forChange[o];
		}
	}
	return name;
}

// api에서 데이터를 받아오는 함수
function getData(url) {
	var req = new Request(url);

	return fetch(req).then(function(response) {
		return response.text();
	}).then(function(responseObject) {
		var data = parsingXMLData(responseObject);
		return data;
	}).catch(function(err) {
		console.log(JSON.stringify(err));
	});
}

module.exports = {
	changeAttributeName: changeAttributeName,
	getData: getData
};