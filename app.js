/*
	Logistik von Naturfit einbauen
	wenn disconnect Verlauf am Server speichern? MySQL?
*/

var http = require('http');
var app = http.createServer();
var io = require('socket.io').listen(app);

app.listen(80); // fuer lokal auf 8000 aendern, sonst 80

// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function(socket) {
	
	socket.room = {};
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function(data, index) {
		// we tell the client to execute 'updatechat' with 2 parameters
		socket.broadcast.to(socket.room[index]).emit('updatechat', socket.userid, data);
		/* ueberpruefen: */ socket.broadcast.to(socket.room[index]).emit('updateconsole', data);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(userid, username) {
		// we store the username in the socket session for this client
		socket.userid = userid;
		socket.username = username;
		// add the client's username to the global list
		usernames[userid] = username;
		// echo to client they've connected
		/* ueberpruefen: */ socket.emit('updateconsole', 'Successfully connected to node server.');
		/* ueberpruefen: */ socket.emit('updateconsole', usernames); // sagt mir wer alles da ist, sendet nur an mich
		// echo globally (all clients) that a person has connected
		// /* ueberpruefen: socket.broadcast.to(socket.room[index]).emit('updateconsole', username + ' has connected'); */
		// update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});
	
	// funktioniert super; vllt. index eintragen um mehrere Raeume zu ermoeglichen
	socket.on('addroom', function(roomname, index) {
		socket.emit('updateconsole', roomname+' '+index);
		socket.room[index] = roomname;
		/* ueberpruefen: */ socket.emit('updateconsole', 'You are in room '+roomname);
		/* ueberpruefen: */ socket.emit('updateconsole', socket.room);
		socket.join(roomname);
	});

	// hat online nicht funktioniert ???
	// when the user disconnects.. perform this
	socket.on('disconnect', function() {
		// remove the username from global usernames list
		delete usernames[socket.userid];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		/* ueberpruefen: */ socket.broadcast.emit('updateconsole', socket.username + ' has disconnected.');
	});
});