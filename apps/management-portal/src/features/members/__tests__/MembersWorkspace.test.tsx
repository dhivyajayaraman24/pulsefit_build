import { renderToStaticMarkup } from 'react-dom/server';
import { MembersWorkspace } from '../MembersWorkspace';

type UiTest = {
  name: string;
  run: () => void;
};

export const membersWorkspaceUiTests: UiTest[] = [
  {
    name: 'finance users see statuses and eligibility reasons without create/edit actions',
    run: () => {
      const markup = renderToStaticMarkup(<MembersWorkspace persona="finance" />);

      expectMarkup(markup, 'Payment due');
      expectMarkup(markup, 'Reason: Payment due');
      expectMarkup(markup, 'Collect payment or send renewal link before booking.');
      expectMarkup(markup, 'Read only');
      expectNotInMarkup(markup, 'New member');
      expectNotInMarkup(markup, 'aria-label="Edit member"');
    },
  },
  {
    name: 'branch managers only see their scoped branch member list',
    run: () => {
      const markup = renderToStaticMarkup(<MembersWorkspace persona="branchManager" />);

      expectMarkup(markup, 'Indiranagar branch');
      expectMarkup(markup, 'Aarav Mehta');
      expectMarkup(markup, 'Nisha Rao');
      expectNotInMarkup(markup, 'Whitefield');
      expectNotInMarkup(markup, 'Koramangala');
    },
  },
];

function expectMarkup(markup: string, expected: string) {
  if (!markup.includes(expected)) {
    throw new Error(`Expected rendered markup to include "${expected}".`);
  }
}

function expectNotInMarkup(markup: string, unexpected: string) {
  if (markup.includes(unexpected)) {
    throw new Error(`Expected rendered markup not to include "${unexpected}".`);
  }
}

for (const testCase of membersWorkspaceUiTests) {
  testCase.run();
}
