import { UsgsPage } from './app.po';

describe('usgs App', () => {
  let page: UsgsPage;

  beforeEach(() => {
    page = new UsgsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
