# HTML Basics

--
html

-----------------------------------------------
## Introduction

This quiz focuses on the **basics HTML**, the language of the web.

Use the *next* and *previous* question arrows above to move between questions.

In each question you will be shown some HTML code and be asked to either *predict* what it does, or to suggest *changes* that would fix / alter the code in some way:

```html
<h1>Welcome!</h1>
<p>This is a great web page.</p>
<p>A nice <a href="http://cheese.com">link</a></p>
```


Or you may be shown a web page and be asked to think about *what HTML code* created it:

<div class="webview">
    <title>Web Page Demo</title>

    <h2>Yum!</h2>

    <p>Some things we like:</p>

    <ul>
        <li>Cheese</li>
        <li>Bikes</li>
        <li>Rockets</li>
    </ul>
</div>

--
### Notes on HTML

**HTML** stands for *H*yper-*T*ext *M*arkup *L*anguage.

**Hyper-text** means text that contains hyper-*links* to other documents (i.e. you can click a link and end up somewhere new).

**Markup** means codes / symbols added to text to highlight or alter the meaning of parts of the text. In HTML we usually refer to the markup as '*tags*':

 - Tags start with a `<` character, and end with a `>`, e.g. `<header>` or `<div>`.
 - Tags generally come in *pairs*, a starting tag and an ending tag. Ending tags contain a `/`, e.g. `<main> ... </main>` or `<h1> ... </h1>`.
 - Some tags don't need an ending since they don't wrap around any text, e.g. `<br>` (line-break) or `<img>` (image).
 - Some tags contain additional information as *attributes*, e.g. an image tag requires a source (src) and alternative (alt) text: `<img src="pickle.png" alt="A tasty pickle">`


-----------------------------------------------
## Question 1

Take a look at this code for a very simple web page...

[#1]
```html
<!doctype html>

<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Fun Times!</title>
  </head>

  <body>
    <h1>Welcome!</h1>
  </body>
</html>
```

--
### What is the purpose of the `<!doctype>` tag?

1. It identifies the code as being an HTML web page
2. It is not a valid HTML tag and shouldn't be there
3. It makes the text on the page look big and bold

--
Every web page must have a `<!doctype html>` tag as the first line.

This tells the browser that it is *an HTML web page*, rather than some other type of file (e.g. just plain text, or a script).


-----------------------------------------------
## Question 2

Take a look at this code for a very simple web page...

[#4-7]
```html
<!doctype html>

<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Fun Times!</title>
  </head>

  <body>
    <h1>Welcome!</h1>
  </body>
</html>
```

--
### What is the purpose of the `<head> ... </head>` block?

1. It contains informtaion about the web page. It is not part of the visible page
2. It is a section that is shown at the top of the web page
3. It is used to make a part of the web page look more important

--
The `<head> ... </head>` block holds information *about* the page, such as links to stylesheets, scripts, meta data (e.g. page author, etc.)

It is not part of the visible page (except the `<title>` text which is shown in the browser tab)


-----------------------------------------------
## Question 3

Take a look at this code for a very simple web page...

<div class="webview">
    <title>Web Page Demo</title>

    <h1>Heading 1</h1>
    <h2>Heading 2</h2>
    <h3>Heading 3</h3>
    <h4>Heading 4</h4>
    <h5>Heading 5</h5>
    <h6>Heading 6</h6>

    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sapien leo, vehicula at vestibulum sed, feugiat vitae enim. Aliquam nec est ac elit gravida egestas. Quisque in tellus sodales felis vulputate hendrerit vitae quis velit. Etiam purus leo, accumsan vel condimentum vitae, consectetur in turpis.</p>

    <ol>
        <li>Cheese</li>
        <li>Bikes</li>
        <li>Rockets</li>
    </ol>

    <p>Fusce malesuada est vel leo rutrum ullamcorper. Etiam eget justo vel lectus vulputate suscipit. Maecenas et pulvinar nulla. Morbi eu mi metus, sit amet imperdiet tellus. Nullam eget dui non sem dictum vestibulum a eu risus. Pellentesque dolor est, venenatis ac tristique tincidunt, fringilla pulvinar enim.</p>

    <ul>
        <li>Cheese</li>
        <li>Bikes</li>
        <li>Rockets</li>
    </ul>

    <nav>
        <ul>
            <li><a href="#">Link</a>
            <li><a href="#">Link</a>
            <li><a href="#">Link</a>
            <li><a href="#">Link</a>
        </ul>
    </nav>

    <main>
        <h2>Main Heading</h2>

        <section>
            <h3>Section Heading</h3>

            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sapien leo, vehicula at vestibulum sed, feugiat vitae enim. Aliquam nec est ac elit gravida egestas.</p>
        </section>
    </main>

</div>


--
### What?

1. It contains stuff
2. It is a thing

