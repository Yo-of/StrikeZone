# STRIKEZONE

I wanted to make this project to see if I could make a football (we don't call it soccer) game from scratch w/o any engine nor library. Just me, a canvas and little to no free time (final exams are near and I still didn't start).
Spoiler Alert : It work but I still didn't won any game (if you do send me and email at **mohammedlouali27@gmail.com** I wanna see this miracle).

Also, yes, I know it look like Haxball a lot and that there is EFootball but hey, this is waaay better (please let me in my desilusion)

---

## So what does it do

It's a top-down 2D football (again we don't call it soccer) game. You're the blue guy on which it's written "YOU" (obviously). You play against a BOT team of 3 outfield players and a goalkeeper. you have 2 minutes. score more goals than them.
that's it. that's football.

Also:
- the ball has actual physics — friction, wall bouncing, momentum
- the CPU goalkeeper tracks the ball along the goal line and actually saves stuff
- a yellow arrow above your player points toward the opponent's goal so you never get lost
- goal celebration screen flashes when someone scores
- full-time screen shows the result and lets you restart

---

## Controls 

- **WASD or arrow keys** to move your player around the pitch
- **Shift** to sprint (you'll need it)
- **Space** or the on-screen button to kick the ball toward goal

---

## How it works

Everything runs on the HTML5 Canvas API. each frame, the game loop clears the canvas, redraws the pitch (stripes, center circle, penalty areas, goal nets), then updates and redraws every entity (your player, the 4 BOT players, and the ball).
 
Player movement is normalized so diagonal movement doesn't feel faster than straight movement. ball physics are just velocity + friction applied every frame, with bounce logic on walls and goal detection on the left and right edges.
 
The BOTs uses simple chase AI: outfield players move toward the ball with a small positional offset so they don't all stack on top of each other. the goalkeeper stays glued to the goal line and only moves vertically to track the ball. when any BOT gets close enough to the ball, it nudges it toward the player's goal. not smart, but effective enough to be annoying.
 
---

## Stack

Vanilla HTML, CSS and JavaScript and images for the favicon. no frameworks, no libraries, no game engines. 
Just three files and a browser.

index.html: structure
style.css: layout and visuals
game.js: everything that actually moves
the images : favicon

---

## AI Usage

I used AI to help me debug parts of the code ainly because I didn't write well functions and the how was gonna work the physics logic. All the rest was made by **me**