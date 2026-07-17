import { ContentPage } from "@/components/content-page";

export default function ContactPage() {
  return (
    <ContentPage title="Contact us">
      <p>
        Have a question or found a problem? Email us at{" "}
        <a className="text-primary underline" href="mailto:support@roomeyfinder.com">
          support@roomeyfinder.com
        </a>
        .
      </p>
      <h2 className="text-xl font-semibold text-foreground">FAQ</h2>
      <p>
        Contact details are revealed only after both people accept an interest. You can manage
        incoming and outgoing interests from the Interests page.
      </p>
    </ContentPage>
  );
}
