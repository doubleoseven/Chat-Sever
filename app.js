/*
Server Code
Version 1.0.1
Yumna Aziz Ansari
*/

var express = require('express'),
	app = express(), // a function the bundles togeather 
	// manually create an http server
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

	//Keep track of the nicknames
	nicknames = [];



server.listen(3000);

// Create a route, to acess pages such as the index.html

//sends us to the index file
app.get('/', function(req, res) 
{
	res.sendFile(__dirname + '/index.html');
});

// receive the message 
// turn on a connection event. Emitted whenever a user connects to the server
io.sockets.on('connection', function(socket)
{
	// the data for the new user
	socket.on('new user', function(data, callback) // the callback is used to send the data back to the client
	{
		if(nicknames.indexOf(data) != -1) // if the data does not exist, it will return -1
		{
			callback(false);
		} else
		{
			callback(true);

			socket.nickname = data; // very important later on. Can be used to bind the user to it's socket. Will be used to remove the user later on.

			// push the nickname into the nicknames list
			nicknames.push(socket.nickname);

			// Update all the user's lists
			updateNicknames();
			// Return to the client side where it will receive the data from the callback

		}
	});

	function updateNicknames()
	{
		io.sockets.emit('usernames', nicknames);
	}

	//use the same event name to receive the message 
	socket.on('send message', function(data)
	{
		// the message should go to all the other users including the one who sent it
		io.sockets.emit('new message', {msg: data, nick: socket.nickname});
		//socket.broadcast.emit('new message', data); - would send to everyone except the one who sent it.
	});

	socket.on('disconnect', function(data)
	{
		if(!socket.nickname) return // if the user does not exist because he/she closed the browser then just return
		// remove the user
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		// update the user list
		updateNicknames();
	});

});


