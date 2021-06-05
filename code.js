
function filterObject(obj, callback) {
	return Object.fromEntries(Object.entries(obj).
		filter(([key, val]) => callback(val, key)));
};

let filtersDifficulty = -1;
let filtersPremium = false;

fetch("https://cdn.jsdelivr.net/gh/programistazpolski/codewell-filters@master/filters.json")
	.then(resp => resp.json())
	.then(data => {
		document.querySelector(".challenges .header").outerHTML += `<h4>Filter challenges</h4>
	<label for="difficulty">Difficulty (0-3)</label>
	<input type="range" name="difficulty" id="difficulty" min="0" max="3">
	<br>
	<label for="difficulty">Premium?</label>
	<input type="checkbox" name="premium" id="premium">
	
	<h5>Filtered Challenges</h5>
	
	<div id="filtered" class="row"></div>
	<br>
	<h6>All challenges</h6>`;

		document.querySelectorAll("#premium, #difficulty").forEach(el => {
			el.addEventListener("input", e => {
				if (e.target.id === "premium") {
					e.target.checked ? filtersPremium = true : filtersPremium = false;
				};

				if (e.target.id === "difficulty") {
					filtersDifficulty = e.target.value;
				};

				let filtered = Object.keys(filterObject(data, entry => {
					return (entry.difficulty == filtersDifficulty) && (entry.premium === filtersPremium);
				}));

				document.querySelector("#filtered").innerHTML = "<br>";

				filtered.forEach(challenge => {
					fetch("https://api.codewell.cc/graphql", {
						"headers": {
							"Accept": "*/*",
							"Accept-Language": "en-CA,en-US;q=0.7,en;q=0.3",
							"content-type": "application/json",
							"Sec-GPC": "1"
						},
						"referrer": "https://www.codewell.cc/",
						"body": "{\"operationName\":\"Challenges\",\"variables\":{\"id\": \"" + challenge + "\"},\"query\":\"query Challenges($id: ID!) {\\n  challenges(where: {id: $id}) {\\n    cover_image {\\n      url\\n      __typename\\n    }\\n    title\\n    description\\n    isPremium\\n    id\\n    __typename\\n  }\\n}\\n\"}",
						"method": "POST",
						"mode": "cors"
					})
						.then(resp => resp.json())
						.then(data => {
							data = data.data.challenges;
							console.log(data);
							document.querySelector("#filtered").innerHTML += `<div class="col-12 col-md-4 card-wrapper"><div class="card"><div class="image"><img style="display: block;" src="${data[0].cover_image.url}"><div class="badge Free">Free</div></div><div class="title">${data[0].title}</div><div class="description"><div id="viewerContainer" class="quill-viewer ql-container ql-snow ql-disabled"><div class="ql-editor" data-gramm="false" contenteditable="false"><p>${JSON.parse(data[0].description).ops[0].insert}</p></div><div class="ql-clipboard" tabindex="-1" contenteditable="true"></div></div></div><div class="action-button"><button type="button" class="ant-btn ant-btn-primary ant-btn-block"><a href="https://www.codewell.cc/challenge/${data[0].id}">View Challenge →</a></button></div></div></div>`;
						});
				})
			});
		});
	})
	.catch(err => {
		console.error(err);
		alert("An error occured when loading the filters. If you want to know more details, check the console.");
	});
