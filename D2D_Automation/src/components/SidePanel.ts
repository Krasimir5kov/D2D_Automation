import {expect,Page,Locator} from '@playwright/test';
import { strict } from 'assert';

export class SidePanel {
  readonly root:Locator;
  readonly closeButton:Locator;
  // Stores the active Playwright page so side panel locators can be created from it.
  constructor(
    private readonly page: Page,
    private readonly testId: string ,
    private readonly closeButtonSidePanel: Locator
    
  ) {
    this.root = page.getByTestId(this.testId);
    this.closeButton = closeButtonSidePanel;
  }
    
  //  get root():Locator {
  //   return this.page.getByTestId(this.testId);
  //  }
   byText(text:string | RegExp):Locator {
    return this.root.getByText(text);
   }
  //  get closeButton():Locator{
  //   return this.closeButtonSidePanel;

  //  }
   async expectVisible(text?: string | RegExp):Promise<void>{
    await expect(text ? this.byText(text) : this.root).toBeVisible();
   }
   async close():Promise<void>{
    await this.closeButton.click();
   }
  }
