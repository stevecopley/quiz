# Scratch Movement

--
scratch

--------------------------------------------------------------------------
## Introduction

This quiz focuses on *sprite movement* in Scratch:

Use the *next* and *previous* question arrows above to move between questions.

In each question you will be shown a set of Scratch code blocks, like this:

```scratch
onflag
goto (0) (0)
point (45)
```

You will be asked to either *predict* what it does, or to suggest  *changes* that would fix / alter the code in some way.

--
### Notes on Movement

* The `goto (100) (-50)` block will place a sprite at the given (x,y) location
* The `point (180)` block will rotate a sprite to face in the given direction (0 is up, 90 is right, 180 is down, 270 is left)
* The `move (100)` block will move a sprite the given number of steps in the direction it is facing

--------------------------------------------------------------------------
## Question 1

Take a look at this code...

```scratch
onflag
goto (0) (0)
```

--
### What will the code do?

1. The sprite will move to the centre of the stage
2. The sprite will move to the top-left corner of the stage
3. The sprite will move to the bottom-left corner of the stage

--
The centre of the Scratch stage is (0,0)

--------------------------------------------------------------------------
## Question 2

Take a look at the Scratch stage. We want to move the alien up, right and down...

```scratch
stage (axes)
  sprite (i:alien2)  (x:-100) (y:-100)
  sprite (i:alien2)  (x:-100) (y: 100) (o:0.3)
  sprite (i:alien2)  (x: 100) (y: 100) (o:0.3)
  sprite (i:alien2)  (x: 100) (y:-100) (o:0.3)
  arrow (x:-100) (y:-100) (s:200)
  arrow (x:-100) (y: 100) (s:200) (a:90)
  arrow (x: 100) (y: 100) (s:200) (a:180)
endstage
```

--
### Which codde move the alien?

1.  ```
    onflag
    goto (-100) (-100)
    goto (-100) (100)
    goto (100) (100)
    goto (100) (-100)
    ```

2.  ```
    onflag
    goto (-100) (-100)
    goto (100) (100)
    goto (-100) (100)
    goto (100) (-100)
    ```

3.  ```
    onflag
    goto (100) (100)
    goto (100) (-100)
    goto (-100) (-100)
    goto (-100) (100)
    ```

--
The left of the stage is negative x, the right is positive x

The bottom of the stage is negative y, the top is positive y

So ```goto (100) (100)``` moves to the top-right part of the stage

