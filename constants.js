// this is all items we need in this game
const items = {
  cherry: {
    name: "cherry",
  },
  se7en: {
    name: "se7en",
  },
  cherrySe7en: {
    name: "cherry-se7en",
  },
  bar: {
    name: "bar",
  },
  barX2: {
    name: "barX2",
  },
  barX3: {
    name: "barX3",
  },
  bars: {
    name: "bars",
  },
  position: {
    any: "any",
    top: "top",
    center: "center",
    bottom: "bottom",
  },
  availablePosition: ["top", "center", "bottom"],
  availableItems: [
    {
      name: "cherry",
      center: -270,
      top: -360,
      bottom: -180,
    },
    {
      name: "se7en",
      center: -180,
      top: -270,
      bottom: -90,
    },
    {
      name: "bar",
      center: 0,
      top: -90,
      bottom: -360,
    },
    {
      name: "barX2",
      center: -90,
      top: -180,
      bottom: 0,
    },
    {
      name: "barX3",
      center: -360,
      top: 0,
      bottom: -270,
    },
  ],
  modes: {
    random: "random",
    fixed: "fixed",
  },
};

// this is data used in pay-table
const dataPayTable = [
  {
    items: [items.cherry.name, items.cherry.name, items.cherry.name],
    position: items.position.bottom,
    score: 4000,
  },
  {
    items: [items.cherry.name, items.cherry.name, items.cherry.name],
    position: items.position.top,
    score: 2000,
  },
  {
    items: [items.cherry.name, items.cherry.name, items.cherry.name],
    position: items.position.center,
    score: 1000,
  },
  {
    items: [items.se7en.name, items.se7en.name, items.se7en.name],
    position: items.position.any,
    score: 150,
  },
  {
    items: [
      items.cherrySe7en.name,
      items.cherrySe7en.name,
      items.cherrySe7en.name,
    ],
    position: items.position.any,
    score: 75,
    combines: ["cherry", "se7en"],
  },
  {
    items: [items.barX3.name, items.barX3.name, items.barX3.name],
    position: items.position.any,
    score: 50,
  },
  {
    items: [items.barX2.name, items.barX2.name, items.barX2.name],
    position: items.position.any,
    score: 20,
  },
  {
    items: [items.bar.name, items.bar.name, items.bar.name],
    position: items.position.any,
    score: 10,
  },
  {
    items: [items.bars.name, items.bars.name, items.bars.name],
    position: items.position.any,
    score: 5,
    combines: ["bar", "barX2", "barX3"],
  },
];
