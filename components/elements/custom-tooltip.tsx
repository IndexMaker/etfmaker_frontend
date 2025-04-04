import * as Tooltip from "@radix-ui/react-tooltip";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
}

const CustomTooltip = ({ children, content }: TooltipProps) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align="center"
            className="z-50 bg-accent backdrop-blur-3xl text-primary text-[11px] rounded-[8px] shadow-lg border border-accent"
          >
            {content}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default CustomTooltip;
