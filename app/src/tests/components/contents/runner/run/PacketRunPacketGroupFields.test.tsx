import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen, waitFor, within } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "../../../../../app/components/Base/Form";
import { packetRunFormSchema } from "../../../../../app/components/contents/runner/run/PacketRunForm";
import { mockGitBranches, mockPacketGroupsParameters, mockRunnerPacketGroups } from "../../../../mocks";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
// eslint-disable-next-line max-len
import { PacketRunPacketGroupFields } from "../../../../../app/components/contents/runner/run/PacketRunPacketGroupFields";
import { server } from "../../../../../msw/server";

const ComponentWithFormWrapper = () => {
  const form = useForm<z.infer<typeof packetRunFormSchema>>({
    resolver: zodResolver(packetRunFormSchema)
  });

  return (
    <Form {...form}>
      <form>
        <PacketRunPacketGroupFields form={form} branchCommit={mockGitBranches.defaultBranch} />
      </form>
    </Form>
  );
};

describe("PacketRunPacketGroupFields component", () => {
  it("should render error component when if error when fetching packet groups", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    render(<ComponentWithFormWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading packet groups/i)).toBeVisible();
    });
  });

  it("should render packet groups select and allow selection & update params if no params", async () => {
    render(<ComponentWithFormWrapper />);

    const packetGroupSelect = await screen.findByRole("combobox", { name: /packet group/i });
    userEvent.click(packetGroupSelect);

    await waitFor(() => {
      mockRunnerPacketGroups.forEach((packetGroup) => {
        expect(screen.getByText(packetGroup.name)).toBeVisible();
      });
    });
    userEvent.click(screen.getByText(mockRunnerPacketGroups[0].name));

    await waitFor(() => {
      expect(screen.getByText(/No parameters available for this packet group/i)).toBeVisible();
    });
    expect(within(packetGroupSelect).getByText(mockRunnerPacketGroups[0].name)).toBeVisible();
  });

  it("should render params fields when params are available for packet group", async () => {
    render(<ComponentWithFormWrapper />);

    const packetGroupSelect = await screen.findByRole("combobox", { name: /packet group/i });
    userEvent.click(packetGroupSelect);
    userEvent.click(screen.getByText(mockRunnerPacketGroups[1].name));

    await waitFor(() => {
      mockPacketGroupsParameters[mockRunnerPacketGroups[1].name].forEach((param, index) => {
        expect(screen.getByText(param.name)).toBeVisible();
        expect(screen.getAllByRole("textbox")[index].getAttribute("value")).toBe(param.value?.toString());
      });
    });
  });
});
