Section 1: File explanation
index.html --> The webpage to be run
VORP.js --> The javascript code that implements the main algorithm
style.css --> The stylesheet for the page
d3.v5.min.js --> D3 visualization library


Section 2: What to be expected on the webpage
The page has 3 parts. 

Part 1 --> Configuration
Enter all the parameters needed to solve the VORP problem. If the user choose to leave blank a box, the program will take its default value indicated in the placeholder. 

Attention! I have not figured out a way to adjust the speed of animation when the calculation is undergoing. Thus, the speed of animation has to be preset. 

Part 2 --> Player list
The cost and vorp of each player is initially randomly generated. However, the user can opt to change specific information of each player. 

Part 3 --> Table for dynamic programming
After the user hits "Start optimization" button, the table will animate the calculation in the backend. The subsolution that is being examined will be highlighted with light red, and the subsolution where the optimal current solution comes from will be highlighted orange. 

When the calculation is over, the browser will prompt an alert indicating how much budget is actually spent, as sometimes it is not necessary to spend all the budget to maximize total VORP. 

The chosen player will be highlighed yellow in Part 2 Player list. When the user opt to change information of a certain player, all the highlights will be wiped away and the player list will be updated. 


Warning: I have not added a functionality to detect false input (such as non-numbers), thus the user has to make sure that he/she enters correct formats of inputs. 