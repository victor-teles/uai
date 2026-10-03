"use client";

import {
  AuthorCard,
  AuthorCardAvatar,
  AuthorCardBio,
  AuthorCardFollow,
  AuthorCardHeader,
  AuthorCardLink,
  AuthorCardLinks,
  AuthorCardName,
  AuthorCardRole,
  type AuthorCardVariant,
} from "@/components/ui/uai/author-card";

export function AuthorCardPreview({ variant = "card" }: { variant?: AuthorCardVariant }) {
  return (
    <AuthorCard variant={variant}>
      <AuthorCardAvatar name="Marta Oliveira" />
      <AuthorCardHeader>
        <div>
          <AuthorCardName>Marta Oliveira</AuthorCardName>
          <AuthorCardRole>Staff engineer, Payments</AuthorCardRole>
        </div>
        <AuthorCardFollow />
      </AuthorCardHeader>
      <AuthorCardBio>
        Writes about retry budgets, idempotent APIs, and the boring parts of moving money between
        banks.
      </AuthorCardBio>
      <AuthorCardLinks>
        <AuthorCardLink href="#posts" onClick={(event) => event.preventDefault()}>
          42 posts
        </AuthorCardLink>
        <AuthorCardLink href="#github" onClick={(event) => event.preventDefault()}>
          GitHub
        </AuthorCardLink>
        <AuthorCardLink href="#site" onClick={(event) => event.preventDefault()}>
          marta.dev
        </AuthorCardLink>
      </AuthorCardLinks>
    </AuthorCard>
  );
}
