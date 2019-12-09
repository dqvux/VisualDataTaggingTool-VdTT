const { override, fixBabelImports, addLessLoader } = require('customize-cra');

const addWebpackTarget = target => config => {
  config.target = target;
  return config;
};


module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      "@text-color": "#5f4e56",
      "@primary-color": "#5f4e56"
    }
  }),
  addWebpackTarget("electron-renderer")
);