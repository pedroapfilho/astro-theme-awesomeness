import plugin from "tailwindcss/plugin";

const awesomenessPreset = plugin(({ addUtilities, addVariant }) => {
  addVariant("dark", "&:is(.dark *)");

  addUtilities({
    "[data-icon='inline-end']": { marginInlineStart: "0.375rem" },
    "[data-icon='inline-start']": { marginInlineEnd: "0.375rem" },
  });
});

export default awesomenessPreset;
