import * as Tooltip from "@radix-ui/react-tooltip";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  key: string;
}

const CustomTooltip = ({ children, content, key }: TooltipProps) => {
  return (
    <Tooltip.Provider key={key}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align="center"
            className="z-50 bg-[#3a3a3a] text-white text-xs rounded-lg shadow-lg border border-[#afafaf1a]"
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
