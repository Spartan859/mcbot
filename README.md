# mcbot

A Minecraft bot

## Install

```shell
npm install
```

## Usage

Create `.env` file:

```
MC_HOST=<mc server host>
MC_USERNAME=<username>
MC_AUTH=offline
```

Then start the bot:

```shell
npm start
```

Support commands in game:
### come
- `/msg <bot> come`: Make the bot come to you.

### gotoxz
- `/msg <bot> gotoxz <x> <z>`: Make the bot go to the coordinates.

### tree
- `/msg <bot> tree setstand <x> <y> <z>`: Set the position where bot stands when planting trees.
- `/msg <bot> tree settree <x> <y> <z>`: Set the coordinates of the dirt below the bot.
- `/msg <bot> tree setlever <x> <y> <z>`: Set the coordinates of the lever for turning on/off the tree factory.
- `/msg <bot> tree start`: The bot will turn on the tree factory by activating the lever, then plant trees continuously.
- `/msg <bot> tree stop`: The bot will turn off the tree factory and stand by(Implement later with FSM).

### sleep
- `/msg <bot> sleep`: The bot will automatically find a bed which can be reached without digging or building and sleep. Will wake up on other tasks.

## Contributing

PRs are welcome.

## License

GPL-3.0-or-later © Zijian Zhang
