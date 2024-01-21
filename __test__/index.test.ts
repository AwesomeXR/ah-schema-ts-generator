import { createTsTypeMapFromModule } from '../src';
import * as Path from 'path';

describe('createTsTypeMapFromModule', () => {
  it.skip('test', async () => {
    const map = await createTsTypeMapFromModule(Path.resolve(__dirname, './fixture.ts'));
    expect(map).toMatchSnapshot();
  });
});
