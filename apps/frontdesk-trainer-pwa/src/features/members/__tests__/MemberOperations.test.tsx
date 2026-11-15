import { renderToStaticMarkup } from 'react-dom/server';
import { MemberOperations } from '../MemberOperations';

type UiTest = {
  name: string;
  run: () => void;
};

export const memberOperationsUiTests: UiTest[] = [
  {
    name: 'front desk users see blocked eligibility reasons and resolution actions',
    run: () => {
      const markup = renderToStaticMarkup(<MemberOperations persona="frontDesk" />);

      expectMarkup(markup, 'Ineligible');
      expectMarkup(markup, 'Reason: Payment is due before this booking/check-in can continue.');
      expectMarkup(markup, 'Resolution: Collect payment at desk or send a renewal link.');
      expectMarkup(markup, 'Collect payment');
      expectMarkup(markup, 'Send renewal link');
    },
  },
  {
    name: 'trainer users cannot take escalation actions',
    run: () => {
      const markup = renderToStaticMarkup(<MemberOperations persona="trainer" />);

      expectMarkup(markup, 'Indiranagar scope');
      expectMarkup(markup, 'Access blocked');
      expectNotInMarkup(markup, 'Escalate</button>');
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

for (const testCase of memberOperationsUiTests) {
  testCase.run();
}
