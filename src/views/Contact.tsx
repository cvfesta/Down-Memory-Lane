import { Card } from '@heroui/react'
import { InquiryForm } from '../components/InquiryForm'

export function Contact() {
  return (
    <section className="pt-11">
      <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Get in touch</h1>
      <p className="mb-10 mt-3.5 max-w-[520px] text-neutral-600 dark:text-neutral-400">
        Everything in the collection is offered online and direct. Send a message about any piece and we will get right
        back to you.
      </p>

      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col gap-7">
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-widest text-neutral-600 dark:text-neutral-400">Out &amp; about</div>
            <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              We also set up at antique fairs and flea markets around the area. Drop us a line to find out where we will
              be next, or to arrange a local viewing or pickup.
            </p>
          </div>
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-widest text-neutral-600 dark:text-neutral-400">Response</div>
            <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              Most messages are answered within a day or two. Pieces are first-come, first-served — if something catches
              your eye, reach out.
            </p>
          </div>
        </div>

        <Card>
          <Card.Content className="p-6">
            <InquiryForm
              subject="Message via Down Memory Lane"
              heading="Send a message"
              intro="Questions, a piece you are hunting for, or to arrange a visit."
              submitLabel="Send message"
              messagePlaceholder="How can we help?"
              messageRows={5}
              successTitle="Thank you."
              successText="Your message has been sent — we will get back to you soon."
            />
          </Card.Content>
        </Card>
      </div>
    </section>
  )
}
