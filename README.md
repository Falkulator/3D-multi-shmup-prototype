Description
---------------------

A prototype multiplayer browser based shoot 'em up I decided to make to get familiar with some of the newest web technologies.

- I used the [GLGE][] library for the WebGL rendering

- [Node.js][] on the server

- [Socket.io][] for the websockets 


**Future Plans**

1. Reduce bandwidth consumption

2. Chat

3. Game Modes (Deathmatch, Team Deathmatch, Survial)

4. AI (for Survival)

5. More weapons 

**Known Bugs**

- On Chrome in Windows, keyup even ignored when mousemove event triggered.

Try It
--------------------

WASD moves your cube, aim and shoot with the mouse.

**Notes:**

- Still in heavy development. 

- Uses a lot of bandwidth.

**Dependencies**

- Node.js

- Change the serverip variable in index.html and start the server with node app.js, Default port is 3000.


[GLGE]: http://www.glge.org/
[Node.js]: http://nodejs.org/
[Socket.io]: http://socket.io/
