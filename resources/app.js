var DATE = getDate(); //needs to be globally defined to avoid the wrong keys being used when updating a description on different days than the page was loaded on.
var myFirebaseRef = new Firebase("https://holidays.firebaseio.com/");

function loadData() {
	//when this data is updated, the socket fires this vvv function
	myFirebaseRef.child(DATE).on("value", function(data) {
		if (document.getElementsByClassName('card')[0]) { //Does not execute on first render
			document.body.removeChild(child);		//need to clean the dom to prep for repopulation
			var section = document.createElement('section');
			section.className = 'container';
			document.body.appendChild(section);
		}
		else {
			var child = document.getElementsByClassName('loader')[0];
			document.body.removeChild(child);
		}
		renderData(data.val());
	});
}

function updateListener (targetId) {
	var targetElementNumber = targetId.split('-')[1]
	var targetField = targetId.split('-')[0];
	var whiteListForInputs = [
		'description',
		'conditional',
		'image',
		'fake'
	];
	var whiteListForChecked = [//for checkboxes to use more symantic html interactions
		'conditional',
		'fake'
	];

	if (whiteListForInputs.indexOf(targetField) > -1) {
		var holidayRef = myFirebaseRef.child(DATE + '/' + targetElementNumber);
		var holObj = {};
		if (whiteListForChecked.indexOf(targetField) > -1) {
			holObj[targetField] = document.getElementById(targetField + '_input-' + targetElementNumber).checked;
		}
		else {
			holObj[targetField] = document.getElementById(targetField + '_input-' + targetElementNumber).value;
		}
		holidayRef.update(holObj);
	}
}

function getDate () {
	var today = new Date();
    var day = today.getDate();
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var month = months[today.getMonth()];
    // var yyyy = today.getFullYear();
    day<10 ? day='0'+ day : ''
    return month + '/' + day;
}



function renderData (data) {
	for (i = 0; i < data.length; i++) {

		var card = document.createElement('div');
		card.className = 'card';

			var image = document.createElement('div');
			image.className = 'image';

				var scrim = document.createElement('div');
				scrim.className = 'scrim';
				image.appendChild(scrim);

				var menu = document.createElement('div');
				menu.className = 'menu';

					for (n = 0; n < 3; n++) {
						var dot = document.createElement('div');
						dot.className = 'menu-dot';
						menu.appendChild(dot);
					}

				image.appendChild(menu);

				var title = document.createElement('h2');
				title.appendChild(document.createTextNode(data[i].name));
				image.appendChild(title);

			card.appendChild(image);

			var content = document.createElement('div');
			content.className = 'content';

				var description = document.createElement('p')
					var text = data[i].description !== ''? data[i].description : 'This holiday does not have a description yet. Please feel free to contribute by adding one!';
				description.appendChild(document.createTextNode(text));

				content.appendChild(description)

					var learnButton = document.createElement('div');
					learnButton.className = 'buttons flat-button';

						var button = document.createElement('button');
						button.className = 'flat-button';
						button.appendChild(document.createTextNode('Learn More'));

					learnButton.appendChild(button);

				content.appendChild(learnButton);

			card.appendChild(content);
			
			// var descriptionMod = document.createElement('form');
			// 	var descriptionField = document.createElement('input');
			// 	if (data[i].description !== ''){
			// 		descriptionField.value = data[i].description;
			// 	}
			// 	else {
			// 		descriptionField.value = 'This holiday does not have a description yet. Please feel free to contribute by adding one!';
			// 	}
			// 	descriptionField.placeholder = 'Type description here...';
	  //   		descriptionField.type = 'text';
	  //   		descriptionField.id = 'description_input-' + i;
	  //   		descriptionMod.appendChild(descriptionField);

	  //   		var descriptionButton = document.createElement('input')
	  //   		descriptionButton.type = 'button';
			// 	descriptionButton.value = 'update description';
			// 	descriptionButton.id = 'description-' + i;
			// 	descriptionMod.appendChild(descriptionButton);
			// content.appendChild(descriptionMod);

			// var conditionalMod = document.createElement('form');
			// 	var conditionalField = document.createElement('input');
	  //   		conditionalField.type = 'checkbox';
	  //   		conditionalField.id = 'conditional_input-' + i;
	  //   		conditionalMod.appendChild(conditionalField);

			// 	// var label = document.createElement('label')
			// 	// label.htmlFor = "id";
			// 	// label.appendChild(document.createTextNode('text for label after checkbox'));
			// 	// container.appendChild(checkbox);
			// 	// container.appendChild(label);

	  //   		var conditionalButton = document.createElement('input');
	  //   		conditionalButton.type = 'button';
			// 	conditionalButton.value = 'update conditional';
			// 	conditionalButton.id = 'conditional-' + i;
 		// 		conditionalMod.appendChild(conditionalButton);
			// content.appendChild(conditionalMod);

		var target = document.getElementsByClassName('container')[0];
		target.appendChild(card);
	};
}

loadData()

document.body.addEventListener("click", function(event){
			console.log('body')
			// updateListener(event.srcElement.id)
		});