# Python Variables

--

python



---

## Introduction

This quiz focuses on the use of *variables* in Python: 

Use the *next* and *previous* question arrows above to move between questions.

In each question you will be shown a short snippet of Python code, like this:

```python
price = 25.50
gst = price * 0.15
cost = price + gst
print( cost )
```

You will be asked to either *predict* what it does, or to suggest  *changes* that would fix / alter the code in some way.

--

### Notes About Variables

* To create a variable called *age* and set its value to the number *7*, you would write: `age = 7`
* To create a variable called *name* and set its value to the text string *Bob*, you would write: `name = "Bob"` (note the speech marks around the text)
* Variables can be set using the values of other variables, like this: `area = height * width` or `cost = price + gst`
* The value of a variable can be adjusted like this: `score = score + 100` (adds 100 to the score)

---

## Question 1

Take a look at this code...

```python
age = 16
print( age )
```

--

### What will the code do?

1. It will show the text `age`
2. It will show the number `16`
3. There will be an error

--

2

--

If you `print()` a variable, the computer will display the variables *value*, not its name



---

## Question 2

Take a look at this code...

```python
name = "Bob"
print( "name" )
```

--

### What will the code do?

1. It will show the text `name`
2. It will show the text `Bob`
3. There will be an error

--

1

--

Variables names should not have speech marks around them, otherwise the computer will just think the name is an ordinary piece of text.



---

## Question 3

Take a look at this code...

```python
top score = 2000
print( top score )
```

--

### What will the code do?

1. It will show the text `top score`
2. It will show the number `2000`
3. There will be an error

--

3

--

Variable names must *never have spaces* in them, nor start with numbers, and generally, they should always start with a lowercase letter.

Examples of valid variable names in this case are: `top_score`, `topScore`, `topscore`

Note that the first two are easier to read due to the use of an *underscore between words*, or a *capital letter at the start of words*



---

## Question 4

Take a look at this code... 

```python
school = Waimea
print( school )
```

At the moment, this code will give an error. 

Can you work out why, and suggest a fix?

--

### What is your fix?

1. Change the first line to `school = "Waimea"`
2. Change the second line to `print( "school" )`

--

1

--

If you want to store some text (a *string*) in a variable, the text must have *speech marks around it*.

So in this case it should be `"Waimea"`, not `Waimea`

