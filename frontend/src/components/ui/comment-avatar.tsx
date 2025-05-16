import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface CommentAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  /** Tailwind size utility, e.g. "size-5". Default: size-5 */
  sizeClass?: string;
  className?: string;
}

export function CommentAvatar({
  name,
  avatarUrl,
  sizeClass = "size-5",
  className,
}: CommentAvatarProps) {
  return (
    <Avatar className={`${sizeClass} ${className ?? ""}`.trim()}>
      <AvatarImage alt={name ?? undefined} src={avatarUrl ?? undefined} />
      <AvatarFallback>{name?.[0]}</AvatarFallback>
    </Avatar>
  );
}
