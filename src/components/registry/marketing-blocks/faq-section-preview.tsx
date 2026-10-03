import {
  FaqSection,
  FaqSectionAnswer,
  FaqSectionDescription,
  FaqSectionEmpty,
  FaqSectionHeader,
  FaqSectionItem,
  FaqSectionList,
  FaqSectionQuestion,
  FaqSectionSearch,
  FaqSectionTitle,
  type FaqSectionVariant,
} from "@/components/uai/faq-section";
import {
  SearchFieldClear,
  SearchFieldControl,
  SearchFieldInput,
  SearchFieldLabel,
  SearchFieldMessage,
} from "@/components/ui/uai/search-field";

const questions = [
  {
    question: "Can we keep our existing phone number?",
    answer:
      "Yes. Forward calls and voicemail to your Ferrow number, or port the number over in about five business days.",
  },
  {
    question: "How does billing work when crews change size?",
    answer:
      "You pay for active seats. Adding someone mid-cycle is prorated, and removed seats are credited on the next invoice.",
  },
  {
    question: "Do customers need to install an app?",
    answer:
      "No. Arrival windows and replies work over text message and email, so customers use what they already have.",
  },
  {
    question: "Where is our data stored?",
    answer:
      "Customer records are stored in the region you choose at signup, encrypted at rest, and backed up every hour.",
  },
  {
    question: "Can we import jobs from a spreadsheet?",
    answer:
      "Upload a CSV with addresses and dates. Ferrow matches columns automatically and shows a preview before importing.",
  },
];

export function FaqSectionPreview({ variant = "list" }: { variant?: FaqSectionVariant }) {
  return (
    <FaqSection variant={variant}>
      <FaqSectionHeader>
        <FaqSectionTitle>Questions before you switch</FaqSectionTitle>
        <FaqSectionDescription>
          Search the answers, or write to support@ferrow.example for anything we missed.
        </FaqSectionDescription>
      </FaqSectionHeader>
      <FaqSectionSearch>
        <SearchFieldLabel style={{ fontWeight: 550 }}>Search questions</SearchFieldLabel>
        <SearchFieldControl>
          <SearchFieldInput placeholder="Try “billing” or “phone”" />
          <SearchFieldClear />
        </SearchFieldControl>
        <SearchFieldMessage />
      </FaqSectionSearch>
      <FaqSectionList>
        {questions.map((item, index) => (
          <FaqSectionItem key={item.question} defaultOpen={index === 0}>
            <FaqSectionQuestion>{item.question}</FaqSectionQuestion>
            <FaqSectionAnswer>
              <p style={{ margin: 0 }}>{item.answer}</p>
            </FaqSectionAnswer>
          </FaqSectionItem>
        ))}
      </FaqSectionList>
      <FaqSectionEmpty>
        <p style={{ margin: 0 }}>No questions match that search.</p>
        <a href="#contact" style={{ color: "var(--uai-text)", fontWeight: 550 }}>
          Ask the support team
        </a>
      </FaqSectionEmpty>
    </FaqSection>
  );
}
