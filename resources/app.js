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
		else { // Removes the loading animation from the dom
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
	if (targetField === 'menu') {
		//launch the modal
		var modal = document.getElementsByClassName('modalDialog')[0];
		modal.className += ' modalDialog-active';

		//update the form on the modal to match the data element that will be modified.
		var button = document.getElementsByClassName('form-button')[0];
		button.id = 'button-' + targetElementNumber;
		//update the values of the form with what is in firebase

		myFirebaseRef.child(DATE + '/' + targetElementNumber).on("value", function(data) {

			document.getElementById('holiday').value = data.val().name;
			document.getElementById('description').value = data.val().description;
			document.getElementById('image').value = data.val().image;
			document.getElementById('conditional').checked = data.val().conditional;
		});

	}
	
	if (targetField === 'close') {
		resetForm();
	}

	if (targetField === 'button') {
		//grab the contents of the form
		var holidayRef = myFirebaseRef.child(DATE + '/' + targetElementNumber);
		var holObj = {};

		//shove all the contents up into the object
		holObj['name'] = document.getElementById('holiday').value;
		holObj['description'] = document.getElementById('description').value;
		holObj['image'] = document.getElementById('image').value;
		holObj['conditional'] = document.getElementById('conditional').checked;
		holObj['fake'] = document.getElementById('fake').checked;
		holidayRef.update(holObj);
		//console.log(holObj)
		resetForm();
		loadData();
	}

}

function resetForm () {
	var modal = document.getElementsByClassName('modalDialog')[0];
	modal.className = 'modalDialog';
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
			if (data[i].image !== '') {
				//update the background image
				image.style.backgroundImage = 'url("' + data[i].image + '")';
			}
			image.className = 'image';

				var scrim = document.createElement('div');
				scrim.className = 'scrim';
				image.appendChild(scrim);

				var menu = document.createElement('div');
				menu.id = 'menu-' + i;
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
					var text = data[i].description !== '' ? data[i].description : 'This holiday does not have a description yet. Please feel free to contribute by adding one!';
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
			
		var target = document.getElementsByClassName('container')[0];
		target.appendChild(card);
	};
}

loadData();

document.body.addEventListener("click", function(event){
	updateListener(event.srcElement.id || event.srcElement.parentNode.id)
});