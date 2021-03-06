{
	"translatorID": "8df4f61b-0881-4c85-9186-05f457edb4d3",
	"label": "PhilPapers",
	"creator": "Sebastian Karcher",
	"target": "^https?://philpapers\\.org",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-09-24 13:06:01"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2012 Sebastian Karcher 
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.match(/\/s|pub\//)) return "multiple";
	if (url.match(/\/browse\//) && ZU.xpathText(doc, '//ol[@class="entryList"]/li/@id')!= null) return "multiple";
	if (url.match(/\/rec\//)) return "journalArticle";
}
	

function doWeb(doc, url){

	var ids = new Array();
	if(detectWeb(doc, url) == "multiple") { 
		var items = {};
		var titles = ZU.xpath(doc, '//li/span[@class="citation"]//span[@class="articleTitle"]');
		var identifiers = ZU.xpath(doc, '//ol[@class="entryList"]/li/@id');
		for (var i in titles) {
			items[identifiers[i].textContent] = titles[i].textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				ids.push(i.replace(/^e/, ""));
			}
			scrape(ids, function () {});
		});
	} else {
		var identifier = url.match(/(\/rec\/)([A-Z-\d]+)/)[2]
		//Z.debug(identifier)
		scrape([identifier]);
	}
}

function scrape(identifier){
	Z.debug(identifier)
	for (var i in identifier){
	var bibtexurl= "http://philpapers.org/export.html?__format=bib&eId="+identifier[i]+"&formatName=BibTeX";
	//Z.debug(bibtexurl);
	Zotero.Utilities.HTTP.doGet(bibtexurl, function (text) {
	//Z.debug(text);
	//remove line breaks, then match match the bibtex.
	bibtex = text.replace(/\n/g, "").match(/<pre class='export'>.+<\/pre>/)[0];
	//Zotero.debug(bibtex)
 	var url = "http://philpapers.org/rec/" + identifier[i];
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(bibtex);
		translator.setHandler("itemDone", function(obj, item) {
			item.attachments = [{url:url, title: "PhilPapers - Snapshot", mimeType: "text/html"}];
			item.complete();
			});	
		translator.translate();
		});
	}	
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://philpapers.org/rec/COROCA-4",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Josep",
						"lastName": "CorbÃ\\-",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "PhilPapers - Snapshot",
						"mimeType": "text/html"
					}
				],
				"itemID": "CorbA2011-COROCA-4",
				"volume": "26",
				"issue": "4",
				"abstractNote": "In Values and the Reflective Point of View (2006), Robert Dunn defends a certain expressivist view about evaluative beliefs from which some implications about self-knowledge are explicitly derived. He thus distinguishes between an observational and a deliberative attitude towards oneself, so that the latter involves a purely first-person point of view that gives rise to an especially authoritative, but wholly non-observational, kind of self-knowledge. Even though I sympathize with many aspects of Dunn's approach to evaluative beliefs and also with his stress on the practical significance of self-knowledge, I argue that his proposal seriously misinterprets the role of observation and evidence within the first-person point of view and, derivatively, in the formation of evaluative beliefs",
				"title": "Observation, Character, and A Purely First-Person Point of View",
				"publicationTitle": "Acta Analytica",
				"date": "2011",
				"pages": "311–328",
				"libraryCatalog": "PhilPapers"
			}
		]
	},
	{
		"type": "web",
		"url": "http://philpapers.org/browse/causal-realism",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://philpapers.org/pub/6",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://philpapers.org/s/solipsism",
		"items": "multiple"
	}
]
/** END TEST CASES **/