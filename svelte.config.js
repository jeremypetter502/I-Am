import sveltePreprocess from 'svelte-preprocess';

export default {
  preprocess: sveltePreprocess(),
  compilerOptions: {
    compatibility: {
      componentApi: 4
    }
  }
};
