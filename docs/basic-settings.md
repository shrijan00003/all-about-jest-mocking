# Basic Settings

Jest Configuration on the package.json

```json
{
  "rootDir": "src",
  "testEnvironment": "node",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

Scripts

```json
  "scripts": {
    "start": "tsx src/index",
    "test": "jest  --coverage"
  },

```
