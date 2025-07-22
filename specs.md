# Space Taxi Clone Dusky Vibe Taxi

## can be used for sky colors, sunset colors, horizon colors, cloud colors (not in order)

#ffd89a
#f5ba2e
#fa782d
#df4d3e
#bc4241
#97374a
#7c4b61
#63395d

## can be used for buildings, window shades, window outlines, brick, vegetation (not in order)

#372a3b
#777b3c
#545225
#384024
#1d2d22
#0b1f2a
#291911
#522e20
#252526
#1f1f1f
#141414

## Elements Of

Pixel Art, Space Taxi, simple pew pew games, simple procedural cityscape, old school graphics and sound

## UI

thrust level from taxi (displayed as 'Thrust'), cash level (payout from missions). maybe minimap view?

## Progression

-   maps generated get increasingly harder, and the player will have to service more customers while dealing with increased hazards

-   maps require a certain number of passengers delivered in a certain time to fulfill quota (from hq)

-   maps always start with player spawned and idle. When the taxi moves the counter starts(silently, or a meter)

-   taxi/player can spawn on rooftops or street level

-   player cant go broke and incurs costs from impacts and certain hazards and rough landings and killing passengers else gameover

## Maps Overview

# Schema and Layouts

-   Buildings

    -   Number Of Platforms Each: 1-3
    -   Height : 10% of screen height to 65% of screen height
    -   Color : see above
    -   Windows Per Floor (some backlit, some unlit)

-   Platforms

    -   Location (Either on building or on ground)

-   Taxi
    -   W key: main thrust
    -   A and D keys: lateral thrust
    -   S key: spacebrake
    -   SHIFT key: afterburner
    -   Left mouse : fire energy weapon

## Maps

-   start less wide and get wider in dimensions (height staying rougly the same -- we are just covering more of the "city" as the player progresses)

-   player spawns on landing platforms with blinky red light (like a landing zone)

-   passengers spawn
