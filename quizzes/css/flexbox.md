# CSS FlexBox

--
css

-----------------------------------------------
## Introduction

This quiz focuses on the use of **flexbox** in CSS to layout elements of a web page. In each question you will be shown some CSS code and be asked to either *predict* what it does, or to suggest *changes* that would fix / alter the code in some way:

```css
main {
    display: flex;
    gap: 1rem;
}
```

Or you may be shown a web page and be asked to think about *the CSS code* that styled it:

<div class="webview" id="flexdemo">
    <title>Web Page Demo</title>
    <style>
        #flexdemo {
            padding: 0;
            font-family: sans-serif;
        }
        #flexdemo header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 1rem;
            background-color: #369;
            color: #fff;
        }

        #flexdemo header > * {
            margin: 0;
        }

        #flexdemo main {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
    </style>

    <header>
        <h1>Yum!</h1>
        <p>Menu</p>
    </header>

    <main>
        <p>Some things we like:</p>

        <ul>
            <li>Cheese</li>
            <li>Bikes</li>
            <li>Rockets</li>
        </ul>
    </main>
</div>

--
### Notes on FlexBox



-----------------------------------------------
## Question 1

Here is part of a web page:

```html
<section id="items">
    <h2>Item 1</h2>
    <h2>Item 2</h2>
    <h2>Item 3</h2>
</section>
```

Take a look at this CSS styling code...

```css
#items {
    display: flex;
    gap: 1rem;
}
```

--
### What is the effect of this CSS?

1. The child elements of the section will sit side-by-side
2. The child elements of the section will flow down the page
3. The child elements of the section will not be displayed

--
By default, an element that is made into a flexbox will cause its child elements to *flow across the page*, side-by-side.


