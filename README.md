## Spin machine

#### Setup
To run the game, simply open **index.html** in browser. 

Makes sure to have internet connection so CDN packages can load properly.

**Tech used**: VueJS with Vuetify and basic CSS

---

#### General
In case balance is 0, Random spin button will be disabled and message will be shown to update the balance.

In case user wants to hide the win table, they can do so with a "Show win table" toggle. It will not toggle back if win happens, but they can open it after the win and the corresponding row will blink.

In case any combination of BAR icons is required for a win, script checks if there is one occurance of each bar icons in line. 3 reels, 3 different bar icons in line but in different order. 

In case of any combination of Charry and 7, script checks if there is at least one cherry and one 7 in line with a wildcard anywhere else.

Balance can be set when "Debug mode" is active. There is also a button to easily set balance to 0.

Balance is set with a slider, with range 1-5000 (inclusive), to ensure user actually inputs an integer seemlesly. Selected number is shown in disabled input on the side. 

---

## Discussion points

Current implementation is not earning money at best, but it should be a decent proof of concept.
In real world example, the order of symbols in each reel would be different, to minimize the win chanches, and/or some symbols would be duplicated.

#### Spinning

Single cycle of a reel spin, used to determine position of elements for debug mode:
| Tic    | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|--------|---|---|---|---|---|---|---|---|---|---|
| 3xBar  | T | T | C | B | B |   |   |   |   |   |
| Bar    | C | B | B |   |   |   |   |   | T | T |
| 2xBar  | B |   |   |   |   |   | T | T | C | B |
| 7      |   |   |   |   | T | T | C | B | B |   |
| Cherry |   |   | T | T | C | B | B |   |   |   |

T=Top; C=Center; B=Bottom

Tic represents how many steps the reel has to move to get to the desired view. 

Number of tics is equal to (number of elements in a reel) times 2. (probably; tested with a few basic examples of 6, 7 and 8 elements, but it makes sense given the pattern - each element is top two times in a row untill top position is taken by the next element).

`element_in_reel * 2 = tics`

By this logic, it's possible to have more elements in the reel.
When randoming the number of tics, what's important is the remains of division with 10, in case number of tics is less then 10 (in actuality, there are 10 tics, but given that the starting number is 0, it works fine)

Example:

`209%10 = 9` => Symbols shown, according to table above, will be Bar and 2xBar.

In case number of tics is more than 9, number to divide with is 100

In case number of tics is more than 99, number to divide with is 1000...

So basic formula for number to divide with is

`10^(number of digits in max number of tics)`

#### Saving of elements

To save the position of elements and to determine a win, 3x3 matrix is used

````
[
    [r1, r2, r3], // top
    [r1, r2, r3], // center
    [r1, r2, r3], // bottom
]

// r = reel
````

Element is set in position while spinning by checking the top attribute assigned to it.

In case it's set to center, top and bottom positions are set to null.

In case it's set to top ot bottom, center position is set to null.


Using a matrix could allow for more payline options as it would be fairly easy to determine also vertical wins or any odd pay-line paths wins, as most modern video slot machines have nowadays.

All it needs is to add comparison functions for new paylines and enable function to select multiple reels.

Using matrix like this could also allow adding more reels easily. 

I am not sure how bulletproff is the implementation to adding more positions to reels, given how debuging logic is tied to tics taken to reach certain view.

setInterval is used to emulate spinning effect, as it's basically working like a while loop with a slight delay.

#### Current issues and possible upgrades: 

- Because at the moment tic is pretty much hardcoded in debug mode to ensure reels fall on correct position, order of elements can't be changed.

- This chould be fixed by calculating which elements falls where when the app is loaded and store that information in an object. Maybe somehting like: 

````
// this is more clear example that would be easy to debug in case issue would arise
const ticPositions = {
    "3xBAR": {
        top: [0, 1],
        center: [2],
        bottom: [3, 4]
    },
    .
    .
    .
}

// then in debugMixin.js 
// check element and positon selected,
// ex. if selected symbol is set to be on top
// set something along the lines:

// s is base number of spins
// default set to 200

// d is object that stores selected
// symbol, reel ID and position chosed

this.spin(d[reel].id, s + ticPositions[ d[reel].symbol ].top[1]);

// selecting second number in top, as it's the value
// that represents the position when symbol is fully on top, not partially
// this could also allow for more flexibility in testing, as the tester could have selection for full or partial position
````

#### Reel time stop 
The way time requirement is met is finicky at best. Because we know that there is max 10 tics to get a full spin, first reel is randomed between 200 and 210 (inclusive), second reel gets a random number between 250 and 260 and third one gets random value between 300 and 310.

This works out because setInterval is set to 10 so, ex. 200*10 = 2000 (2seconds)... But it's not precise.

If first reel gets a value randomed at 210 and second one gets a value at 250, that's not 0.5s of difference, that's 0.4s difference.
So, reels fall after each other in any time between 0.4s and 0.6s (inclusive).

In debug mode, spins don't follow this requirement at all. 

---

#### Why Vue?
It's JavaScript library that's the freshest to me at the moment and it allowed me to focus on implementing the basic logic without spending too much time on setting up a project. It also doesn't require any localhost server setups so it's fairly easy to run the game, provided CDN assets are properly loaded.

The logic chosen could work with pure JavaScript or just Jquery, but I like the abstarctions Vue has for handling UI changes.
Vuetify, again, to save time for thinking about the solution and not about element position and styling or other tiny utility methods needed to make sure everything runs smoothly. 

#### Other ideas

I did research other possible tools, mainly PixiJS and Phaser or other JavaScript game engines but they are not my strongest points so it was counter intuitive to focus my energy there.

I also considered using something like Godot and then export the game to web, but since it depends on browser suporting WebAssembly, which is pretty experimental at the momement, I figured it wasn't worth the trouble. And Godot doesn't really handle exporting to web that well :)

Perhaps if in debug mode, tester could set position of reel by incrementally changing the view (arrows up and down, over and under a reel), reels would not be limited to only 3 rows. But this looks a bit tideous. 

Overall, I feel the implementation is a decent proof of concept that can be easily expanded on, regardless of tools used.