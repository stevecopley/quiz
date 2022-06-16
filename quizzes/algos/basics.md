# Algorithms

--
mermaid

-----------------------------------------------
## Introduction

This is a test...

```mermaid
graph TD
    A([START])
    B[ask the user for a number]
    C{number is...}
    D[say 'positive']
    E[say 'negative']
    F[say 'zero']
    G[show the number]
    H[subtract 1 from number]
    I{number < 0}
    Z(END)

    A --> B
    B --> C
    C -- > 0 --> D
    C -- < 0 --> E
    C -- = 0 --> F
    D --> G
    E --> Z
    F --> Z
    G --> H
    H --> I
    I -- yes --> Z
    I -- no --> G
```

--

Some pseudocode...

```pseudo
start
  ask user for a number

  if the number is 0 then...
    say the number is zero
  
  if the number < 0 then...
    say the number is negative

  if the number > 0 then...
    say the number is positive
    repeat this...
      show the number
      subtract 1 from the number
    until number < 0
  end if
end
```



-----------------------------------------------
## Question 1

Look at this:

```mermaid
graph TD
    A([START]) --> B[go shopping]
    B --> C{done?}
    C -- yes --> D[pay]
    C -- no --> E[have a think]
    E --> B
    D --> F([END])
```


--
### What?

1. Thing
2. Stuff

--
Yes!


