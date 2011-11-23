require 'spec_helper'

describe 'core' do
  before :each do
    @registry_hash = Registry.instance.instance_variable_get('@registry')
  end

  describe 'report_view_widgets' do
    %w{failed pending changed unchanged}.each_with_index do |stat, i|
      it "should have an #{800 + i}_#{stat} callback" do
        @registry_hash[:core][:report_view_widgets]["#{800 + i}_#{stat}"].should be
      end
    end
  end
end
